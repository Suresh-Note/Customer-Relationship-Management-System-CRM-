#!/usr/bin/env node
/**
 * Simple file-based migration runner for PostgreSQL.
 *
 * Usage:
 *   node src/config/migrate.js          — apply pending migrations
 *   node src/config/migrate.js status   — show migration status
 *
 * Migrations live in backend/migrations/ as numbered SQL files:
 *   001_initial_schema.sql
 *   002_lead_notes.sql
 *   ...
 *
 * Applied migrations are tracked in a `schema_migrations` table.
 */
require("./env");  // load .env first

const fs   = require("fs");
const path = require("path");
const { Pool } = require("pg");

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     Number(process.env.DB_PORT) || 5432,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getApplied() {
  const result = await pool.query("SELECT version FROM schema_migrations ORDER BY version");
  return new Set(result.rows.map((r) => r.version));
}

function getPendingFiles(applied) {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log("No migrations directory found at:", MIGRATIONS_DIR);
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => !applied.has(f));
}

async function migrate() {
  await ensureTable();
  const applied = await getApplied();
  const pending = getPendingFiles(applied);

  if (!pending.length) {
    console.log("✅ Database is up to date — no pending migrations.");
    return;
  }

  console.log(`📦 ${pending.length} pending migration(s):\n`);

  for (const file of pending) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    console.log(`  ▶ Applying ${file}…`);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`  ✅ ${file} applied`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  ❌ ${file} FAILED:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log("\n✅ All migrations applied successfully.");
}

async function status() {
  await ensureTable();
  const applied = await getApplied();
  const allFiles = fs.existsSync(MIGRATIONS_DIR)
    ? fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()
    : [];

  console.log("\n📋 Migration Status\n");
  console.log("  Migration                         Status");
  console.log("  ──────────────────────────────────────────");

  for (const file of allFiles) {
    const mark = applied.has(file) ? "✅ applied" : "⏳ pending";
    console.log(`  ${file.padEnd(35)} ${mark}`);
  }

  const pending = allFiles.filter((f) => !applied.has(f));
  console.log(`\n  Total: ${allFiles.length} | Applied: ${applied.size} | Pending: ${pending.length}\n`);
}

// ── CLI entry point ──────────────────────────────────────────────
const command = process.argv[2];

(async () => {
  try {
    if (command === "status") {
      await status();
    } else {
      await migrate();
    }
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
