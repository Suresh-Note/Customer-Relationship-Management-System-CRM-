/**
 * Run once to set a real password for all seed users.
 * Usage: node fix-seed-passwords.js
 * Default password for all seed users: Admin@1234
 */
require("dotenv").config();
const { Pool } = require("pg");
const { hashPassword } = require("./src/utils/password");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || "CRM",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "Admin6",
});

const SEED_PASSWORD = "Admin@1234";

async function run() {
  const hash = hashPassword(SEED_PASSWORD);

  const result = await pool.query(
    `UPDATE users SET password = $1
     WHERE email LIKE '%@astrawincrm.in'
     RETURNING name, email`,
    [hash]
  );

  console.log(`\nUpdated ${result.rows.length} seed users with password: ${SEED_PASSWORD}\n`);
  result.rows.forEach(r => console.log(`  ${r.name} — ${r.email}`));
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
