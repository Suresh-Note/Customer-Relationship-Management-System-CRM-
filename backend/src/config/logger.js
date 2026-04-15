/**
 * Structured logger powered by Pino.
 *
 * - Development: pretty-printed, colorful output
 * - Production:  JSON lines (machine-parseable, fast)
 *
 * Usage:
 *   const log = require("./config/logger");
 *   log.info("Server started");
 *   log.error({ err, reqId }, "Request failed");
 */
const pino = require("pino");

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }),
});

module.exports = logger;
