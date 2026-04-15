const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit    = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const log          = require("./config/logger");
const auth         = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const startTime = Date.now();

// ── HTTPS redirect in production ─────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// ── Request ID middleware ────────────────────────────────────────
// Attaches a unique ID to every request for log correlation
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// ── Request logging ──────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    log[level]({
      reqId:    req.id,
      method:   req.method,
      url:      req.originalUrl,
      status:   res.statusCode,
      duration: `${duration}ms`,
      ip:       req.ip,
    }, "%s %s %d %dms", req.method, req.originalUrl, res.statusCode, duration);
  });
  next();
});

// ── Security headers ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  } : false,  // Disable CSP in dev to avoid blocking Vite HMR
}));

// ── CORS ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      log.warn({ origin }, "CORS: blocked origin");
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ── Cookie parser ────────────────────────────────────────────────
app.use(cookieParser());

// ── Body parsing ────────────────────────────────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ── Rate limiting ───────────────────────────────────────────────
const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please try again later" },
});

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts — try again in 15 minutes" },
});

app.use(globalLimit);

// ── Routes ──────────────────────────────────────────────────────

// Enhanced health check
app.get("/health", async (req, res) => {
  const pool = require("./config/db");
  let dbStatus = "disconnected";
  try {
    const client = await pool.connect();
    client.release();
    dbStatus = "connected";
  } catch { /* ignore */ }

  const uptimeMs = Date.now() - startTime;
  const mem = process.memoryUsage();

  res.json({
    status:    dbStatus === "connected" ? "healthy" : "degraded",
    uptime:    formatUptime(uptimeMs),
    database:  dbStatus,
    memory: {
      rss:  `${Math.round(mem.rss / 1024 / 1024)} MB`,
      heap: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
    },
    version:   require("../package.json").version,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({ message: "AstrawinCRM API running ✅" });
});

// Auth routes
app.use("/api/auth", authLimit, require("./routes/auth.routes"));

// Protected routes
app.use("/api/leads",      auth, require("./routes/leads.routes"));
app.use("/api/deals",      auth, require("./routes/deals.routes"));
app.use("/api/clients",    auth, require("./routes/clients.routes"));
app.use("/api/projects",   auth, require("./routes/projects.routes"));
app.use("/api/tasks",      auth, require("./routes/tasks.routes"));
app.use("/api/invoices",   auth, require("./routes/invoices.routes"));
app.use("/api/activities", auth, require("./routes/activities.routes"));
app.use("/api/teams",      auth, require("./routes/teams.routes"));
app.use("/api/users",      auth, require("./routes/users.routes"));

// ── 404 ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ───────────────────────────────────────────────
app.use(errorHandler);

// ── Helpers ─────────────────────────────────────────────────────
function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

module.exports = app;