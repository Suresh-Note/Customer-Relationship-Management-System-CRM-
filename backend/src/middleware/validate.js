/**
 * Lightweight validation & sanitization helper — zero extra packages.
 *
 * Usage:
 *   const errs = validate(req.body, { name: { required: true, maxLen: 150 } });
 *   if (errs.length) return bad(res, errs);
 */

function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()); }
function isPositiveNum(v) { return !isNaN(v) && Number(v) > 0; }

/**
 * Strip HTML tags and dangerous characters from a string.
 * Prevents stored XSS when values are rendered in the frontend.
 */
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/<[^>]*>/g, "")          // strip HTML tags
    .replace(/[<>]/g, "")             // remove stray angle brackets
    .replace(/javascript:/gi, "")     // remove javascript: protocol
    .replace(/on\w+=/gi, "")          // remove inline event handlers
    .trim();
}

const LEAD_STATUSES    = ["New","Hot","Warm","Cold","Converted"];
const DEAL_STAGES      = ["Prospecting","Qualified","Proposal","Negotiation","Closed Won"];
const PRIORITY         = ["Low","Medium","High"];
const TASK_STATUSES    = ["Pending","In Progress","Done"];
const PROJECT_STATUSES = ["Planning","Active","On Hold","Completed"];
const INVOICE_STATUSES = ["Pending","Paid","Overdue"];
const ACTIVITY_TYPES   = ["Call","Email","Meeting","Note","Task"];
const CLIENT_STATUSES  = ["Active","On hold","Inactive"];

function validate(body, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const val = body[field];
    if (rule.required && (val === undefined || val === null || String(val).trim() === "")) {
      errors.push(`'${field}' is required`);
      continue;
    }
    if (val !== undefined && val !== null && val !== "") {
      if (rule.isEmail && !isEmail(val)) errors.push(`'${field}' must be a valid email`);
      if (rule.positiveNum && !isPositiveNum(val)) errors.push(`'${field}' must be a positive number`);
      if (rule.enum && !rule.enum.includes(String(val))) errors.push(`'${field}' must be one of: ${rule.enum.join(", ")}`);
      if (rule.min !== undefined && Number(val) < rule.min) errors.push(`'${field}' minimum is ${rule.min}`);
      if (rule.max !== undefined && Number(val) > rule.max) errors.push(`'${field}' maximum is ${rule.max}`);
      if (rule.minLen !== undefined && String(val).trim().length < rule.minLen) errors.push(`'${field}' must be at least ${rule.minLen} characters`);
      if (rule.maxLen !== undefined && String(val).trim().length > rule.maxLen) errors.push(`'${field}' must be at most ${rule.maxLen} characters`);
    }
  }
  return errors;
}

function bad(res, errors) {
  return res.status(400).json({ error: errors[0], errors });
}

/**
 * Express middleware that sanitizes all string values in req.body
 * to prevent XSS. Apply AFTER body parsing, BEFORE controllers.
 *
 * Usage:  app.use(sanitizeBody);
 */
function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
  next();
}

module.exports = {
  validate,
  bad,
  sanitize,
  sanitizeBody,
  LEAD_STATUSES,
  DEAL_STAGES,
  PRIORITY,
  TASK_STATUSES,
  PROJECT_STATUSES,
  INVOICE_STATUSES,
  ACTIVITY_TYPES,
  CLIENT_STATUSES,
};
