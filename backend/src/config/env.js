/**
 * Environment validation — runs FIRST on startup.
 * Exits immediately if required variables are missing.
 */
require("dotenv").config();

const REQUIRED = [
  "DB_USER",
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length) {
  console.error("╔══════════════════════════════════════════════════════╗");
  console.error("║  ❌  MISSING ENVIRONMENT VARIABLES                  ║");
  console.error("╠══════════════════════════════════════════════════════╣");
  missing.forEach((key) => {
    console.error(`║  • ${key.padEnd(48)}║`);
  });
  console.error("╠══════════════════════════════════════════════════════╣");
  console.error("║  Copy .env.example → .env and fill in your values   ║");
  console.error("╚══════════════════════════════════════════════════════╝");
  process.exit(1);
}

// Warn about weak secrets in development
if (process.env.NODE_ENV !== "production") {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn("⚠️  JWT_SECRET is very short — use a 64+ char random string in production");
  }
  if (process.env.ADMIN_PASSWORD === "1234") {
    console.warn("⚠️  ADMIN_PASSWORD is '1234' — change this before deploying");
  }
}

module.exports = process.env;
