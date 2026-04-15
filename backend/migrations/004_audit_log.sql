-- Migration 004: Audit Log table
-- Tracks all create / update / delete operations for compliance and debugging.

CREATE TABLE IF NOT EXISTS audit_log (
  log_id     SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(user_id) ON DELETE SET NULL,
  action     VARCHAR(50) NOT NULL,       -- 'CREATE', 'UPDATE', 'DELETE'
  entity     VARCHAR(50) NOT NULL,       -- 'lead', 'client', 'deal', etc.
  entity_id  INT,
  old_data   JSONB,
  new_data   JSONB,
  ip_address VARCHAR(45),               -- supports IPv4 and IPv6
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity    ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user      ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created   ON audit_log(created_at);
