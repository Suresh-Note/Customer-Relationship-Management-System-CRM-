-- Migration 002: Lead Notes table

CREATE TABLE IF NOT EXISTS lead_notes (
  note_id    SERIAL PRIMARY KEY,
  lead_id    INT NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
  note       TEXT NOT NULL,
  created_by VARCHAR(150) DEFAULT 'You',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);
