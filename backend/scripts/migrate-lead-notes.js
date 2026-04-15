require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || "CRM",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "Admin6",
  options:  "-c client_encoding=UTF8",
});

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lead_notes (
      note_id    SERIAL PRIMARY KEY,
      lead_id    INT NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
      note       TEXT NOT NULL,
      created_by VARCHAR(150) DEFAULT 'You',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);
  `);
  console.log("✅ lead_notes table created successfully!");
  await pool.end();
}

migrate().catch(err => { console.error("❌", err.message); process.exit(1); });
