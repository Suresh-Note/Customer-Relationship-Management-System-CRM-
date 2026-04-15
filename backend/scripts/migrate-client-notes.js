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
    CREATE TABLE IF NOT EXISTS client_notes (
      note_id    SERIAL PRIMARY KEY,
      client_id  INT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
      note       TEXT NOT NULL,
      created_by VARCHAR(150) DEFAULT 'You',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);
  `);
  console.log("✅ client_notes table created successfully!");
  await pool.end();
}

migrate().catch(err => { console.error("❌", err.message); process.exit(1); });
