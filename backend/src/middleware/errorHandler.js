const log = require("../config/logger");

const isProd = process.env.NODE_ENV === "production";

function errorHandler(err, req, res, _next) {
  // Structured error logging with request context
  log.error({
    err,
    reqId:  req.id,
    method: req.method,
    url:    req.originalUrl,
    userId: req.user?.userId,
  }, "Request error: %s", err.message);

  // Postgres unique violation
  if (err.code === "23505") {
    return res.status(409).json({ error: "A record with this value already exists" });
  }
  // Postgres foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist" });
  }
  // Postgres not null violation
  if (err.code === "23502") {
    return res.status(400).json({ error: `Field '${err.column}' is required` });
  }
  // JWT errors
  if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Invalid token" });
  if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired — please log in again" });

  const status  = err.status || err.statusCode || 500;
  const message = (isProd && status === 500) ? "Internal server error" : (err.message || "Internal server error");
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
