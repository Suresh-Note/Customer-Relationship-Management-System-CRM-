-- Migration 003: Client Notes table

CREATE TABLE IF NOT EXISTS client_notes (
  note_id    SERIAL PRIMARY KEY,
  client_id  INT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  note       TEXT NOT NULL,
  created_by VARCHAR(150) DEFAULT 'You',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);
