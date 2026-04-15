const jwt    = require("jsonwebtoken");
const pool   = require("../config/db");
const { hashPassword, verifyPassword } = require("../utils/password");

// ── Constants ─────────────────────────────────────────────────────
const MAX_ATTEMPTS         = 5;
const LOCK_MINUTES         = 15;
const SESSION_MAX_DAYS     = 30;   // absolute session lifetime

// ── Helpers ───────────────────────────────────────────────────────
function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
}

/**
 * Password complexity rules — enforced on both register and password change.
 * Returns an array of failure strings (empty = strong enough).
 */
function checkPasswordStrength(pw = "") {
  const failures = [];
  if (pw.length < 8)              failures.push("at least 8 characters");
  if (!/[A-Z]/.test(pw))         failures.push("one uppercase letter");
  if (!/[a-z]/.test(pw))         failures.push("one lowercase letter");
  if (!/[0-9]/.test(pw))         failures.push("one number");
  if (!/[^A-Za-z0-9]/.test(pw))  failures.push("one special character (!@#$…)");
  return failures;
}

function normalizeCountryCode(c = "") {
  const v = String(c).trim().replace(/[^\d+]/g, "");
  return v ? (v.startsWith("+") ? v : `+${v}`) : "";
}

function normalizeContactNumber(cc = "", num = "") {
  const n = String(num).replace(/\D/g, "");
  const c = normalizeCountryCode(cc);
  return c && n ? `${c}${n}` : "";
}

function buildName(firstName = "", lastName = "") {
  return `${firstName} ${lastName}`.trim();
}

function createPayload(user) {
  return {
    userId: user.user_id,
    email:  user.email,
    name:   user.name || buildName(user.first_name, user.last_name) || "User",
    role:   user.role || "User",
  };
}

// ── Cookie helpers ────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";

function setAuthCookies(res, accessToken, refreshToken) {
  const base = {
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? "strict" : "lax",
  };

  // Access token: short-lived, sent with every request
  res.cookie("accessToken", accessToken, {
    ...base,
    maxAge: 15 * 60 * 1000,   // 15 minutes
  });

  // Refresh token: long-lived, only sent to the refresh endpoint
  res.cookie("refreshToken", refreshToken, {
    ...base,
    maxAge: SESSION_MAX_DAYS * 24 * 60 * 60 * 1000,
    path:   "/api/auth",
  });
}

function clearAuthCookies(res) {
  const base = { httpOnly: true, secure: isProduction, sameSite: isProduction ? "strict" : "lax" };
  res.clearCookie("accessToken",  { ...base });
  res.clearCookie("refreshToken", { ...base, path: "/api/auth" });
}

function makeAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
}

function makeRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: `${SESSION_MAX_DAYS}d`,
  });
}

// ── Schema migration (runs once on startup) ───────────────────────
const schemaReady = pool.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name     VARCHAR(100);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name      VARCHAR(100);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code   VARCHAR(10);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS country_name   VARCHAR(120);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_number VARCHAR(30);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS gender         VARCHAR(20);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INT NOT NULL DEFAULT 0;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until   TIMESTAMP;
`).catch(() => {});

// ═══════════════════════════════════════════════════════════════
//  REGISTER
// ═══════════════════════════════════════════════════════════════
exports.register = async (req, res, next) => {
  try {
    await schemaReady;

    const {
      name, firstName: rawFirst, lastName: rawLast,
      email, password, confirmPassword,
      contactNumber, countryCode, countryName, gender,
    } = req.body;

    const normalEmail = String(email).trim().toLowerCase();

    // Derive name: use full name field if provided, else fall back to email local part
    const resolvedName = (name && name.trim()) ? name.trim() : normalEmail.split("@")[0];
    const firstName = (rawFirst || resolvedName.split(" ")[0]).trim();
    const lastName  = (rawLast  || resolvedName.split(" ").slice(1).join(" ")).trim();

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Email, password and confirm password are required" });
    }
    if (!isValidEmail(normalEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // ── Password strength check ───────────────────────────────────
    const weaknesses = checkPasswordStrength(password);
    if (weaknesses.length) {
      return res.status(400).json({
        error: `Password must contain: ${weaknesses.join(", ")}`,
      });
    }

    const normalMobile = countryCode && contactNumber
      ? normalizeContactNumber(countryCode, contactNumber)
      : null;

    const exists = await pool.query(
      "SELECT user_id FROM users WHERE email=$1 LIMIT 1",
      [normalEmail]
    );
    if (exists.rows.length) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashed   = hashPassword(password);
    const fullName = buildName(firstName, lastName);

    const result = await pool.query(
      `INSERT INTO users
         (first_name, last_name, name, email, password, role,
          country_code, country_name, contact_number, gender)
       VALUES ($1,$2,$3,$4,$5,'User',$6,$7,$8,$9)
       RETURNING user_id, name, email, role`,
      [firstName, lastName, fullName, normalEmail, hashed,
       normalizeCountryCode(countryCode), String(countryName||"").trim(), normalMobile, String(gender||"").trim()]
    );

    return res.status(201).json({
      message: "Registration successful. Please sign in.",
    });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════
exports.login = async (req, res, next) => {
  try {
    await schemaReady;

    const { email, password, countryCode, contactNumber } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });

    let result;
    if (email) {
      const normalEmail = String(email).trim().toLowerCase();
      if (!isValidEmail(normalEmail)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      result = await pool.query(
        `SELECT user_id, first_name, last_name, name, email, password, role,
                login_attempts, locked_until
         FROM users WHERE email=$1 LIMIT 1`,
        [normalEmail]
      );
    } else if (countryCode && contactNumber) {
      const mobile = normalizeContactNumber(countryCode, contactNumber);
      if (!mobile) return res.status(400).json({ error: "Invalid country code or mobile number" });
      result = await pool.query(
        `SELECT user_id, first_name, last_name, name, email, password, role,
                login_attempts, locked_until
         FROM users WHERE contact_number=$1 LIMIT 1`,
        [mobile]
      );
    } else {
      return res.status(400).json({ error: "Email or mobile number is required" });
    }

    const user = result.rows[0];
    const BAD_CREDS = "Invalid credentials";   // Generic — never reveals email existence

    if (!user) return res.status(401).json({ error: BAD_CREDS });

    // Lockout check
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const mins = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000);
      return res.status(429).json({ error: `Account locked. Try again in ${mins} minute(s)` });
    }

    if (!verifyPassword(password, user.password)) {
      const attempts = (user.login_attempts || 0) + 1;
      const lock = attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60000)
        : null;

      await pool.query(
        "UPDATE users SET login_attempts=$1, locked_until=$2 WHERE user_id=$3",
        [attempts, lock, user.user_id]
      );

      if (lock) {
        return res.status(429).json({
          error: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes`,
        });
      }

      // NOTE: attemptsLeft intentionally NOT included — avoids confirming email existence
      return res.status(401).json({ error: BAD_CREDS });
    }

    // Successful login — reset lockout counters
    await pool.query(
      "UPDATE users SET login_attempts=0, locked_until=NULL WHERE user_id=$1",
      [user.user_id]
    );

    const payload      = createPayload(user);
    const accessToken  = makeAccessToken(payload);
    const refreshToken = makeRefreshToken(payload);

    // Persist refresh token in DB
    const expiresAt = new Date(Date.now() + SESSION_MAX_DAYS * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1,$2,$3)
       ON CONFLICT (token) DO NOTHING`,
      [user.user_id, refreshToken, expiresAt]
    );

    setAuthCookies(res, accessToken, refreshToken);

    // Return user profile (no tokens in body — they're in httpOnly cookies)
    return res.json({ user: payload });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════
//  REFRESH TOKEN
// ═══════════════════════════════════════════════════════════════
exports.refresh = async (req, res, next) => {
  try {
    // Read refresh token from httpOnly cookie (path: /api/auth/refresh)
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token — please log in again" });
    }

    // Verify it exists in DB
    const stored = await pool.query(
      `SELECT rt.*, u.role, rt.created_at AS session_start
       FROM refresh_tokens rt
       JOIN users u ON u.user_id = rt.user_id
       WHERE rt.token = $1 LIMIT 1`,
      [refreshToken]
    );

    if (!stored.rows.length) {
      clearAuthCookies(res);
      return res.status(401).json({ error: "Invalid refresh token — please log in again" });
    }

    const row = stored.rows[0];

    // Check DB expiry
    if (new Date(row.expires_at) < new Date()) {
      await pool.query("DELETE FROM refresh_tokens WHERE token=$1", [refreshToken]);
      clearAuthCookies(res);
      return res.status(401).json({ error: "Session expired — please log in again" });
    }

    // ── Absolute session lifetime check ──────────────────────────
    const sessionAgeDays = (Date.now() - new Date(row.session_start).getTime()) / 86400000;
    if (sessionAgeDays > SESSION_MAX_DAYS) {
      await pool.query("DELETE FROM refresh_tokens WHERE token=$1", [refreshToken]);
      clearAuthCookies(res);
      return res.status(401).json({ error: "Session expired — please log in again" });
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newPayload  = {
      userId: decoded.userId,
      email:  decoded.email,
      name:   decoded.name,
      role:   row.role,
    };
    const newAccess   = makeAccessToken(newPayload);
    const newRefresh  = makeRefreshToken(newPayload);
    const newExpiry   = new Date(Date.now() + SESSION_MAX_DAYS * 24 * 60 * 60 * 1000);

    // Rotate: delete old, insert new
    await pool.query("DELETE FROM refresh_tokens WHERE token=$1", [refreshToken]);
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [decoded.userId, newRefresh, newExpiry]
    );

    setAuthCookies(res, newAccess, newRefresh);
    return res.json({ user: newPayload });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════════════════════════
exports.logout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  clearAuthCookies(res);

  if (!refreshToken) {
    return res.json({ message: "Logged out successfully" });
  }

  try {
    await pool.query("DELETE FROM refresh_tokens WHERE token=$1", [refreshToken]);
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout token cleanup failed:", err.message);
    return res.json({
      message: "Logged out successfully",
      warning: "Session cookie cleared, but refresh token cleanup could not be confirmed.",
    });
  }
};

// Export the password strength checker so routes can use it
exports.checkPasswordStrength = checkPasswordStrength;
