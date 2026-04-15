const jwt = require("jsonwebtoken");

/**
 * Auth middleware — reads the access token from:
 *  1. httpOnly cookie `accessToken` (primary — most secure)
 *  2. Authorization: Bearer header (fallback for API clients / testing)
 */
function auth(req, res, next) {
  // 1. Cookie (preferred)
  let token = req.cookies?.accessToken;

  // 2. Authorization header fallback
  if (!token) {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      token = header.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required — please log in" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired — please refresh or log in again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = auth;
