/**
 * Audit logging middleware.
 *
 * Logs create / update / delete operations to the audit_log table.
 * Non-blocking — errors in logging never break the request.
 *
 * Usage in routes:
 *   const { auditLog } = require("../middleware/audit");
 *
 *   // After a successful create:
 *   auditLog(req, "CREATE", "lead", newLead.lead_id, null, newLead);
 */
const pool = require("../config/db");
const log  = require("../config/logger");

/**
 * Fire-and-forget audit log entry.
 *
 * @param {Request} req      - Express request (for user & IP)
 * @param {string}  action   - 'CREATE' | 'UPDATE' | 'DELETE'
 * @param {string}  entity   - 'lead', 'client', 'deal', etc.
 * @param {number}  entityId - Primary key of the affected row
 * @param {object}  oldData  - Previous state (null for CREATE)
 * @param {object}  newData  - New state (null for DELETE)
 */
function auditLog(req, action, entity, entityId, oldData = null, newData = null) {
  const userId = req.user?.userId || null;
  const ip     = req.ip || req.connection?.remoteAddress || null;

  pool
    .query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, old_data, new_data, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, entity, entityId, oldData ? JSON.stringify(oldData) : null, newData ? JSON.stringify(newData) : null, ip]
    )
    .catch((err) => {
      // Never let audit failures break the request — just log the issue
      log.warn({ err, action, entity, entityId }, "Audit log write failed (table may not exist yet)");
    });
}

module.exports = { auditLog };
