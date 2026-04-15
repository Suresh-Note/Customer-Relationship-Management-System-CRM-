const { Pool } = require("pg");
const log = require("./logger");

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     Number(process.env.DB_PORT) || 5432,
  // Connection pool tuning
  max:                     20,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle:         true,
  options:                 "-c client_encoding=UTF8",
});

// ── Pool event listeners ─────────────────────────────────────────
pool.on("connect", () => {
  log.debug("pg pool: new client connected");
});

pool.on("error", (err) => {
  log.error({ err }, "pg pool: unexpected error on idle client");
});

// ── Startup connectivity check ───────────────────────────────────
pool
  .connect()
  .then(async (client) => {
    log.info("✅ PostgreSQL connected to '%s'", process.env.DB_NAME);
    client.release();

    // Auto-create supporting tables that may not exist in older schemas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_notes (
        note_id    SERIAL PRIMARY KEY,
        lead_id    INT NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
        note       TEXT NOT NULL,
        created_by VARCHAR(150) DEFAULT 'You',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);

      CREATE TABLE IF NOT EXISTS client_notes (
        note_id    SERIAL PRIMARY KEY,
        client_id  INT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
        note       TEXT NOT NULL,
        created_by VARCHAR(150) DEFAULT 'You',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);

      CREATE TABLE IF NOT EXISTS project_handlers (
        project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
        user_id    INT NOT NULL REFERENCES users(user_id)       ON DELETE CASCADE,
        role       VARCHAR(80) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, user_id, role)
      );
      CREATE INDEX IF NOT EXISTS idx_project_handlers_project ON project_handlers(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_handlers_user    ON project_handlers(user_id);
    `);
    log.info("✅ Supporting tables verified");

    // Ensure lead status constraint includes 'Converted'
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
        ALTER TABLE leads ADD CONSTRAINT leads_status_check
          CHECK (status IN ('New','Hot','Warm','Cold','Converted'));
      EXCEPTION WHEN OTHERS THEN
        NULL; -- ignore if constraint already correct
      END $$;
    `);
    log.info("✅ Lead status constraint verified");
  })
  .catch((err) => {
    log.fatal({ err }, "❌ Database connection failed — exiting");
    process.exit(1);
  });

module.exports = pool;
