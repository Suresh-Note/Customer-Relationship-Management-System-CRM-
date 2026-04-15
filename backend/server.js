// ── Environment validation FIRST (exits if vars are missing) ─────
require("./src/config/env");

const log = require("./src/config/logger");
const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  log.info("🚀 AstrawinCRM API running on port %d (%s)", PORT, process.env.NODE_ENV || "development");
});

// ── Graceful Shutdown ────────────────────────────────────────────
// Ensures open DB connections and in-flight requests are handled
// cleanly when the process is terminated (Ctrl+C, Docker stop, etc.)

function gracefulShutdown(signal) {
  log.info("🛑 %s received — shutting down gracefully…", signal);

  server.close(async () => {
    log.info("   HTTP server closed");

    try {
      await pool.end();
      log.info("   Database pool closed");
    } catch (err) {
      log.error({ err }, "   Error closing database pool");
    }

    process.exit(0);
  });

  // Force-kill after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    log.error("⚠️  Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ── Catch unhandled errors ───────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  log.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  log.fatal({ err }, "Uncaught exception — exiting");
  process.exit(1);
});