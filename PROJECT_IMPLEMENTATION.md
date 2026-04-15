# AstrawinCRM — Complete Project Implementation Document

> **Version:** 1.0.0  
> **Last Updated:** April 2026  
> **Document Type:** End-to-End Technical Implementation Reference

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack & Rationale](#3-technology-stack--rationale)
4. [Backend Implementation](#4-backend-implementation)
5. [Database Design](#5-database-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Frontend Implementation](#7-frontend-implementation)
8. [Module-by-Module Breakdown](#8-module-by-module-breakdown)
9. [Security Implementation](#9-security-implementation)
10. [API Specification](#10-api-specification)
11. [Data Flow & Workflows](#11-data-flow--workflows)
12. [Deployment & DevOps](#12-deployment--devops)
13. [Development Workflow](#13-development-workflow)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 What Is AstrawinCRM?

AstrawinCRM is a **full-stack Customer Relationship Management (CRM) platform** designed to manage the complete customer lifecycle — from initial lead capture through deal negotiation, project delivery, invoicing, and ongoing client management. It is built as a monorepo with a **React SPA frontend** and an **Express REST API backend**, backed by a **PostgreSQL** relational database.

### 1.2 Core Objectives

| Objective | How It's Achieved |
|:----------|:------------------|
| **Full Pipeline Visibility** | Leads → Clients → Deals → Projects → Tasks → Invoices |
| **Role-Based Access** | 6-tier RBAC on both backend API and frontend UI |
| **Enterprise Security** | JWT with refresh rotation, httpOnly cookies, scrypt hashing, audit trail |
| **Real-Time Analytics** | Live dashboard with KPI metrics, pipeline analysis, and revenue tracking |
| **Team Collaboration** | Multi-handler project assignment, team management, activity logging |
| **Production Readiness** | Docker support, migrations, graceful shutdown, structured logging |

### 1.3 Scale & Scope

- **Backend:** 10 controllers, 10 route files, 8 models, 5 middleware layers
- **Frontend:** 12 pages, 9+ components, 3 custom hooks, centralized auth context
- **Database:** 14 tables with foreign keys, CHECK constraints, and indexed lookups
- **Seed Data:** 100 clients, proportional leads, deals, projects, tasks, invoices, activities
- **Roles:** Admin, Manager, Sales, Developer, Marketing, User

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
                          ┌────────────────────────┐
                          │      USER BROWSER       │
                          │                          │
                          │  React 18 SPA (Vite)    │
                          │  ├── AuthContext         │
                          │  ├── ProtectedRoute      │
                          │  ├── 12 Page Components  │
                          │  └── useCrmData Hook     │
                          └───────────┬──────────────┘
                                      │
                         HTTPS / httpOnly Cookies
                                      │
                          ┌───────────▼──────────────┐
                          │     EXPRESS API SERVER     │
                          │                            │
                          │  Middleware Pipeline:       │
                          │  1. Request ID (UUID)      │
                          │  2. Request Logger (Pino)  │
                          │  3. Helmet (Security Hdrs) │
                          │  4. CORS (Origin Check)    │
                          │  5. Cookie Parser          │
                          │  6. Body Parser (50kb)     │
                          │  7. Rate Limiter           │
                          │  8. JWT Auth Middleware     │
                          │  9. RBAC Guard             │
                          │  10. Input Validation      │
                          │  11. Controller Logic      │
                          │  12. Audit Logger          │
                          │  13. Error Handler         │
                          └───────────┬──────────────┘
                                      │
                            pg Pool (max: 20)
                                      │
                          ┌───────────▼──────────────┐
                          │    PostgreSQL 16 Alpine    │
                          │                            │
                          │  14 tables                 │
                          │  Versioned migrations      │
                          │  CHECK constraints         │
                          │  Foreign key cascading     │
                          └────────────────────────────┘
```

### 2.2 Design Principles

1. **Separation of Concerns** — Backend and frontend are fully decoupled projects within a monorepo. The frontend knows nothing about database structure; the backend knows nothing about UI rendering.

2. **Middleware Pipeline** — Every request flows through a consistent, layered pipeline. Each middleware has a single responsibility (auth, validation, RBAC, audit, etc.).

3. **Defense in Depth** — Security is not a single layer but a stack: rate limiting → CORS → helmet → auth → RBAC → input validation → parameterized queries → audit logging.

4. **Graceful Degradation** — The frontend `useCrmData` hook includes fallback data when the API is offline, ensuring the UI remains interactive during backend maintenance.

5. **Convention over Configuration** — Files follow strict naming patterns (`*.controller.js`, `*.model.js`, `*.routes.js`) for navigability and predictability.

---

## 3. Technology Stack & Rationale

### 3.1 Frontend

| Technology | Version | Why It Was Chosen |
|:-----------|:--------|:------------------|
| **React** | 18.2 | Component-based architecture, hooks, virtual DOM performance, massive ecosystem |
| **Vite** | 5.2 | Near-instant HMR, native ES modules, optimized Rollup builds |
| **React Router** | 6.22 | Declarative routing with nested layouts, protected route patterns |
| **Axios** | 1.14 | Request/response interceptors (for auto token refresh), graceful error handling |
| **Tailwind CSS** | 3.4 | Utility-first approach speeds up UI development, consistent design system |

#### Frontend Build Optimization

The Vite config includes **manual code splitting** for optimal caching:

```javascript
// vite.config.js
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ["react", "react-dom"],    // Changes rarely → cached
      router: ["react-router-dom"],       // Changes rarely → cached
    },
  },
},
```

The dev server proxies `/api` requests to the backend, eliminating CORS issues during development.

### 3.2 Backend

| Technology | Version | Why It Was Chosen |
|:-----------|:--------|:------------------|
| **Express** | 4.18 | Mature, minimal, unopinionated — maximum flexibility |
| **pg (node-postgres)** | 8.11 | Direct PostgreSQL driver, no ORM overhead, parameterized queries |
| **Pino** | 9.6 | Fastest Node.js logger, structured JSON output, zero-overhead |
| **Helmet** | 8.1 | One-line security headers (CSP, HSTS, X-Frame-Options, etc.) |
| **jsonwebtoken** | 9.0 | Industry-standard JWT implementation |
| **express-rate-limit** | 8.3 | Simple, in-memory rate limiting |

#### Why No ORM?

The project uses raw SQL via `pg` (parameterized queries) rather than an ORM like Prisma or Sequelize. This was intentional:

- **Performance** — No query generation overhead or N+1 query risks
- **Transparency** — The exact SQL is visible in the model files
- **Flexibility** — Complex queries (JOINs, CTEs, window functions) are straightforward
- **Security** — Parameterized queries make SQL injection impossible at the driver level

### 3.3 Database

| Technology | Version | Why It Was Chosen |
|:-----------|:--------|:------------------|
| **PostgreSQL** | 16 (Alpine) | ACID compliance, CHECK constraints, rich data types, JSON support |

#### Connection Pool Configuration

```javascript
const pool = new Pool({
  max:                     20,       // Maximum concurrent connections
  idleTimeoutMillis:       30000,    // Close idle connections after 30s
  connectionTimeoutMillis: 5000,     // Fail fast on connection issues
  allowExitOnIdle:         true,     // Allow process exit when pool is idle
  options:                 "-c client_encoding=UTF8",
});
```

---

## 4. Backend Implementation

### 4.1 Entry Point (`server.js`)

The server startup follows a strict initialization order:

1. **Environment Validation** — `src/config/env.js` runs first and exits immediately if any required variable is missing. It prints a formatted table of missing variables.

2. **Logger Initialization** — Pino is configured for `pretty` output in development and structured JSON in production.

3. **Express App Bootstrap** — `src/app.js` builds the middleware pipeline and mounts all routes.

4. **HTTP Server Start** — Binds to the configured port.

5. **Graceful Shutdown** — Listens for `SIGTERM` and `SIGINT`, closes the HTTP server (draining in-flight requests), then closes the database pool.

6. **Unhandled Error Catching** — Catches `unhandledRejection` and `uncaughtException` to prevent silent crashes.

```javascript
// Force-kill failsafe: if graceful shutdown hangs for 10s, force exit
setTimeout(() => {
  log.error("⚠️  Forced shutdown after 10s timeout");
  process.exit(1);
}, 10000).unref();
```

### 4.2 Middleware Pipeline (`app.js`)

The Express app applies middleware in a specific, security-critical order:

```
Request ──►
  1. HTTPS Redirect (production only)
  2. Request ID Assignment (UUID v4)
  3. Request Logging (method, URL, status, duration, IP)
  4. Helmet Security Headers
  5. CORS Origin Validation
  6. Cookie Parser
  7. Body Parser (JSON + URL-encoded, 50KB limit)
  8. Global Rate Limiter (500 req / 15 min)
  9. Route Handler (with per-route auth + RBAC)
  10. 404 Handler
  11. Centralized Error Handler
──► Response
```

### 4.3 Controllers

Each controller follows the same pattern:

```javascript
exports.getAll = async (req, res, next) => {
  try {
    const result = await Model.findAll();
    res.json(result.rows);
  } catch (err) {
    next(err);  // Caught by centralized error handler
  }
};
```

| Controller | File | Responsibilities |
|:-----------|:-----|:-----------------|
| **Auth** | `auth.controller.js` | Register, login (email or phone), refresh tokens, logout, password policy |
| **Leads** | `leads.controller.js` | CRUD, notes, convert to client |
| **Clients** | `clients.controller.js` | CRUD, notes, linked projects/deals |
| **Deals** | `deals.controller.js` | CRUD, pipeline stage management |
| **Projects** | `projects.controller.js` | CRUD, multi-handler assignment |
| **Tasks** | `tasks.controller.js` | CRUD, priority + status management |
| **Invoices** | `invoices.controller.js` | CRUD, payment status tracking |
| **Activities** | `activities.controller.js` | CRUD, activity type categorization |
| **Teams** | `teams.controller.js` | CRUD, member management |
| **Users** | `users.controller.js` | Profile management, role updates |

### 4.4 Models (Data Access Layer)

Models are thin wrappers around parameterized SQL queries. Example:

```javascript
// leads.model.js
const pool = require("../config/db");

exports.findAll = () =>
  pool.query("SELECT * FROM leads ORDER BY created_at DESC");

exports.findById = (id) =>
  pool.query("SELECT * FROM leads WHERE lead_id = $1", [id]);

exports.create = (data) =>
  pool.query(
    `INSERT INTO leads (name, email, phone, company, source, status, assigned_to)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.name, data.email, data.phone, data.company, data.source, data.status, data.assigned_to]
  );
```

### 4.5 Error Handling

The centralized error handler (`errorHandler.js`) catches all unhandled errors:

- In **development**: Returns full error message and stack trace
- In **production**: Returns a generic message, logs the full error to Pino

---

## 5. Database Design

### 5.1 Entity-Relationship Overview

```
    ┌──────────────┐
    │    teams     │
    │──────────────│
    │ team_id  PK  │
    │ team_name    │
    │ description  │
    └──────┬───────┘
           │ 1:N
    ┌──────▼───────┐       ┌──────────────┐       ┌──────────────┐
    │    users     │       │    leads     │       │  activities  │
    │──────────────│  1:N  │──────────────│  1:N  │──────────────│
    │ user_id  PK  │◄──────│ assigned_to  │──────►│ lead_id  FK  │
    │ email        │       │ lead_id  PK  │       │ type         │
    │ password     │       │ status       │       │ notes        │
    │ role         │       │ name, email  │       └──────────────┘
    │ team_id  FK  │       └──────┬───────┘
    └──────┬───────┘              │ Convert
           │                ┌─────▼────────┐       ┌──────────────┐
           │                │   clients    │  1:N  │    deals     │
           │                │──────────────│──────►│──────────────│
           │                │ client_id PK │       │ deal_id  PK  │
           │                │ company_name │       │ value        │
           │                │ status       │       │ stage        │
           │                └──────┬───────┘       └──────────────┘
           │                       │ 1:N
           │                ┌──────▼───────┐       ┌──────────────┐
           │                │   projects   │  1:N  │   invoices   │
           │           N:M  │──────────────│──────►│──────────────│
           └───────────────►│ project_id PK│       │ invoice_id PK│
                            │ client_id FK │       │ amount       │
                            │ status       │       │ status       │
                            └──────┬───────┘       └──────────────┘
                                   │ 1:N
                            ┌──────▼───────┐
                            │    tasks     │
                            │──────────────│
                            │ task_id  PK  │
                            │ project_id FK│
                            │ assigned_to  │
                            │ priority     │
                            └──────────────┘
```

### 5.2 Table Specifications

#### Core Tables

| Table | Primary Key | Key Columns | Constraints |
|:------|:------------|:------------|:------------|
| `teams` | `team_id` SERIAL | team_name, description | — |
| `users` | `user_id` SERIAL | email (UNIQUE), password, role | role CHECK (6 values), email UNIQUE |
| `leads` | `lead_id` SERIAL | name, email, phone, status | status CHECK (New/Hot/Warm/Cold/Converted) |
| `clients` | `client_id` SERIAL | company_name, contact_person | status CHECK (Active/On hold/Inactive) |
| `deals` | `deal_id` SERIAL | deal_name, value, stage | stage CHECK (5 stages), probability 0-100 |
| `projects` | `project_id` SERIAL | project_name, service_type, client_id FK | status CHECK (Planning/Active/On Hold/Completed) |
| `tasks` | `task_id` SERIAL | task_name, project_id FK, assigned_to FK | status CHECK (3 values), priority CHECK (3 values) |
| `invoices` | `invoice_id` SERIAL | project_id FK, amount (>0), status | status CHECK (Pending/Paid/Overdue) |
| `activities` | `activity_id` SERIAL | lead_id FK, type, notes | type CHECK (Call/Email/Meeting/Note/Task) |

#### Supporting Tables

| Table | Purpose | Key Design Decisions |
|:------|:--------|:---------------------|
| `project_handlers` | N:M users↔projects with roles | Composite PK (project_id, user_id, role), indexed |
| `lead_notes` | Notes attached to leads | Cascading delete, indexed on lead_id |
| `client_notes` | Notes attached to clients | Cascading delete, indexed on client_id |
| `refresh_tokens` | JWT refresh token storage | Token UNIQUE, indexed for fast lookups |
| `audit_log` | Change audit trail | Stores old_data and new_data as JSONB |

### 5.3 Migration Strategy

Migrations are stored in `backend/migrations/` and numbered sequentially:

| Migration | Purpose |
|:----------|:--------|
| `001_initial_schema.sql` | Core tables: teams, users, leads, clients, deals, projects, tasks, invoices, activities, refresh_tokens |
| `002_lead_notes.sql` | Lead notes table + index |
| `003_client_notes.sql` | Client notes table + index |
| `004_audit_log.sql` | Audit log table for tracking mutations |

The migration runner (`src/config/migrate.js`) tracks applied migrations in a `schema_migrations` table and applies only pending ones. It supports:

- `npm run migrate` — Apply all pending migrations
- `npm run migrate:status` — Show which migrations have been applied

Additionally, `db.js` performs **auto-creation of supporting tables** on startup, ensuring backward compatibility when connecting to older database schemas.

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│  Browser  │                  │  Express  │                  │  Database │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                              │                              │
     │  POST /api/auth/login        │                              │
     │  {email, password}           │                              │
     │─────────────────────────────►│                              │
     │                              │  SELECT user WHERE email=$1  │
     │                              │─────────────────────────────►│
     │                              │◄─────────────────────────────│
     │                              │                              │
     │                              │  ┌─ Verify Password ────┐   │
     │                              │  │ scrypt + timingSafe   │   │
     │                              │  └───────────────────────┘   │
     │                              │                              │
     │                              │  ┌─ Create Tokens ──────┐   │
     │                              │  │ accessToken  (15min)  │   │
     │                              │  │ refreshToken (30 days)│   │
     │                              │  └───────────────────────┘   │
     │                              │                              │
     │                              │  INSERT refresh_tokens       │
     │                              │─────────────────────────────►│
     │                              │                              │
     │  Set-Cookie: accessToken     │                              │
     │  Set-Cookie: refreshToken    │                              │
     │  { user: {...} }             │                              │
     │◄─────────────────────────────│                              │
     │                              │                              │
     │  GET /api/leads              │                              │
     │  Cookie: accessToken=xxx     │                              │
     │─────────────────────────────►│                              │
     │                              │  jwt.verify(accessToken)     │
     │                              │  ──► req.user = payload      │
     │                              │                              │
     │                              │  SELECT * FROM leads         │
     │                              │─────────────────────────────►│
     │  [...leads]                  │◄─────────────────────────────│
     │◄─────────────────────────────│                              │
```

### 6.2 Token Rotation

When the access token expires (after 15 minutes), the frontend Axios interceptor automatically calls `/api/auth/refresh`:

1. The old refresh token is **verified** (JWT signature + DB lookup + expiry check)
2. The old refresh token is **deleted** from the database
3. A **new** access token + refresh token pair is generated
4. The new tokens are set as httpOnly cookies
5. The original failed request is **retried** automatically

This rotation strategy ensures that:
- Stolen refresh tokens can only be used **once** before being invalidated
- Absolute session lifetime is enforced (30 days max regardless of activity)

### 6.3 Cookie Configuration

```javascript
const cookieConfig = {
  httpOnly: true,                        // JavaScript cannot read the cookie
  secure:   process.env.NODE_ENV === "production",  // HTTPS only in prod
  sameSite: isProduction ? "strict" : "lax",         // CSRF protection
};
```

- **Access Token Cookie:** Sent with every request, expires in 15 minutes
- **Refresh Token Cookie:** Path-restricted to `/api/auth` — sent only to auth endpoints

### 6.4 Account Lockout

| Event | Action |
|:------|:-------|
| Failed login attempt | Increment `login_attempts` counter |
| 5th failed attempt | Set `locked_until` = NOW + 15 minutes |
| Successful login | Reset `login_attempts` to 0, clear `locked_until` |
| Login while locked | Return 429 with remaining lockout duration |

### 6.5 Role-Based Access Control (RBAC)

#### Role Hierarchy

```
Admin (Rank 4) ──► Full system access, user management, all CRUD
  │
Manager (Rank 3) ──► Team management, all resource CRUD, cannot manage admins
  │
Sales / Developer / Marketing (Rank 2) ──► Standard CRUD on assigned resources
  │
User (Rank 1) ──► View-only access, cannot create/update/delete
```

#### Backend RBAC Middleware

```javascript
// Usage in routes:
router.delete("/:id", rbac("Admin", "Manager"), controller.delete);
router.get("/",       rbac(),                    controller.getAll);  // any authenticated user
```

The `rbac()` middleware checks if the authenticated user's role rank meets or exceeds the minimum required rank from the allowed roles list.

#### Frontend RBAC

The `<Can>` component and `rbac.js` utility mirror the backend permissions on the UI:

```jsx
<Can role={user.role} perform="delete">
  <button onClick={handleDelete}>Delete</button>
</Can>
```

Standard users see a read-only interface without add/edit/delete buttons or form fields.

---

## 7. Frontend Implementation

### 7.1 Application Shell

The frontend follows a **layout-based routing pattern**:

```
BrowserRouter
  └── AuthProvider (context)
      └── AppRoutes
          ├── /login ──► Login Page (public)
          ├── /preview ──► Dashboard Preview (public)
          └── ProtectedRoute wrapper
              └── Layout (sidebar + content)
                  ├── / ──► Dashboard
                  ├── /leads ──► Leads Management
                  ├── /clients ──► Client Management
                  ├── /deals ──► Deal Pipeline
                  ├── /projects ──► Project Management
                  ├── /tasks ──► Task Board
                  ├── /invoices ──► Invoice Management
                  ├── /activities ──► Activity Timeline
                  └── /team ──► Team Management
```

### 7.2 Authentication Context (`AuthContext.jsx`)

The `AuthProvider` component manages the global auth state:

1. **On Mount:** Calls `GET /api/auth/me` to verify the existing session
2. **Stores User:** In React state + `localStorage` (for persistence across tabs)
3. **Cross-Tab Logout:** Listens to `storage` events — if one tab logs out, all tabs reflect it
4. **Login:** Stores user profile and updates state
5. **Logout:** Calls `POST /api/auth/logout`, clears state, broadcasts to other tabs, redirects

### 7.3 Data Fetching (`useCrmData` Hook)

The `useCrmData` custom hook provides a centralized data layer:

```javascript
const {
  data,           // { leads, clients, deals, projects, tasks, invoices, activities, teams, users }
  isLoading,      // true during initial load
  isRefreshing,   // true during background refresh
  apiStatus,      // "online" | "partial" | "offline"
  usingFallback,  // true if any endpoint used fallback data
  lastUpdated,    // Date of last successful fetch
  errors,         // Array of failed endpoint keys
  refreshData,    // Function to trigger a refetch
  createLead,     // Function to create a lead + optimistic update
} = useCrmData();
```

**Resilience strategy:**
- Uses `Promise.allSettled` — individual endpoint failures don't block other data
- Falls back to static sample data when the API is unreachable
- Tracks which endpoints are online vs. offline for debugging

### 7.4 Axios Instance (`api/axios.js`)

The custom Axios instance includes:

1. **Base URL:** `/api` (proxied through Vite to the backend)
2. **Credentials:** `withCredentials: true` for httpOnly cookie support
3. **Response Interceptor:** On 401 → automatically calls `/api/auth/refresh` → retries the original request
4. **Retry Queue:** Queues requests while a refresh is in-flight to avoid multiple simultaneous refresh calls

### 7.5 Protected Routes

The `ProtectedRoute` component:
- Shows a loading spinner while `AuthContext.isLoading` is true
- Redirects to `/login` if no authenticated user
- Renders the child `Layout` component if authenticated

### 7.6 Idle Timeout (`useIdleTimeout` Hook)

Monitors user activity (mouse, keyboard, scroll, touch) and automatically logs out after a configurable period of inactivity. This prevents session hijacking from unattended browsers.

---

## 8. Module-by-Module Breakdown

### 8.1 Leads Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `leads.controller.js`, `leads.model.js`, `leads.routes.js` |
| **Frontend** | `Leads.jsx` (26KB — largest page) |
| **Features** | CRUD, status management, notes, assignment, **lead → client conversion** |
| **Status Lifecycle** | New → Hot/Warm/Cold → Converted |
| **Conversion** | `POST /api/leads/:id/convert` creates a new client record, sets lead status to "Converted" |

The Leads page features a **two-level navigation toggle** between:
1. **Active Leads** — New, Hot, Warm, Cold status leads
2. **Converted to Clients** — Historical view of all converted leads

### 8.2 Clients Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `clients.controller.js`, `clients.model.js`, `clients.routes.js` |
| **Frontend** | `Clients.jsx` (23KB) |
| **Features** | CRUD, notes, linked projects and deals |
| **Status Lifecycle** | Active → On hold → Inactive |

### 8.3 Deals Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `deals.controller.js`, `deals.model.js`, `deals.routes.js` |
| **Frontend** | `Deals.jsx` (22KB) |
| **Features** | Pipeline management, probability tracking, expected close dates |
| **Pipeline Stages** | Prospecting → Qualified → Proposal → Negotiation → Closed Won |

### 8.4 Projects Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `projects.controller.js`, `projects.model.js`, `projects.routes.js` |
| **Frontend** | `Projects.jsx` (26KB) |
| **Features** | CRUD, date tracking, multi-handler assignment, client linking |
| **Status Lifecycle** | Planning → Active → On Hold → Completed |
| **Handlers** | Multiple users can be assigned with specific roles via `project_handlers` N:M table |

### 8.5 Tasks Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `tasks.controller.js`, `tasks.model.js`, `tasks.routes.js` |
| **Frontend** | `tasks.jsx` (16KB) |
| **Features** | CRUD, project linking, user assignment, deadlines |
| **Status** | Pending → In Progress → Done |
| **Priority** | Low / Medium / High |

### 8.6 Invoices Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `invoices.controller.js`, `invoices.model.js`, `invoices.routes.js` |
| **Frontend** | `invoices.jsx` (17KB) |
| **Features** | CRUD, project linking, payment tracking |
| **Status** | Pending → Paid / Overdue |
| **Validation** | Amount must be > 0 (CHECK constraint) |

### 8.7 Activities Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `activities.controller.js`, `activities.model.js`, `activities.routes.js` |
| **Frontend** | `activities.jsx` (13KB) |
| **Features** | Timeline view, lead linking, type categorization |
| **Types** | Call / Email / Meeting / Note / Task |

### 8.8 Teams Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `teams.controller.js`, `teams.model.js`, `teams.routes.js` |
| **Frontend** | `Team.jsx` (14KB) |
| **Features** | Team CRUD, member listing, team assignment |

### 8.9 Dashboard Module

| Aspect | Details |
|:-------|:--------|
| **Frontend** | `Dashboard.jsx` (19KB) + `DashboardArtifact.jsx` (22KB) |
| **Features** | KPI cards, pipeline visualization, revenue analysis, activity feed |
| **Data Source** | Aggregated from `useCrmData` hook |

### 8.10 Authentication Module

| Aspect | Details |
|:-------|:--------|
| **Backend** | `auth.controller.js` (14KB — largest controller) |
| **Frontend** | `Login.jsx` (17KB) |
| **Features** | Registration with validation, email/phone login, password strength, lockout |

---

## 9. Security Implementation

### 9.1 Password Security

```javascript
// utils/password.js
const crypto = require("crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(32);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const hash = Buffer.from(hashHex, "hex");
  const derived = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(hash, derived);
}
```

Key security properties:
- **scrypt** — Memory-hard KDF, resistant to GPU/ASIC attacks
- **32-byte random salt** — Unique per password, prevents rainbow tables
- **Timing-safe comparison** — Prevents timing attacks on hash comparison

### 9.2 Input Validation & Sanitization

The `validate.js` middleware provides:

1. **Schema Validation** — Required fields, email format, value ranges, string lengths, enum checks
2. **XSS Sanitization** — Applied to ALL string inputs in `req.body`:
   - Strip HTML tags (`<script>`, `<img>`, etc.)
   - Remove `javascript:` protocol
   - Remove inline event handlers (`onclick=`, `onerror=`, etc.)
   - Trim whitespace

3. **SQL Injection Prevention** — All queries use parameterized `$1, $2, ...` placeholders

### 9.3 Rate Limiting

| Limiter | Window | Max Requests | Applied To |
|:--------|:-------|:-------------|:-----------|
| Global | 15 minutes | 500 | All routes |
| Auth | 15 minutes | 20 | `/api/auth/*` only |

### 9.4 Security Headers (Helmet)

Production CSP policy:
```
default-src 'self'
script-src  'self'
style-src   'self' 'unsafe-inline' fonts.googleapis.com
font-src    'self' fonts.gstatic.com
img-src     'self' data: blob:
connect-src 'self'
```

### 9.5 Audit Logging

Every create, update, and delete operation logs:

| Field | Description |
|:------|:------------|
| `user_id` | Who performed the action |
| `action` | CREATE / UPDATE / DELETE |
| `entity` | lead / client / deal / etc. |
| `entity_id` | Primary key of the affected record |
| `old_data` | Previous state (JSON, null for CREATE) |
| `new_data` | New state (JSON, null for DELETE) |
| `ip_address` | Client IP address |
| `created_at` | Timestamp |

The audit logger is **fire-and-forget** — errors in audit logging never break the primary request.

---

## 10. API Specification

### 10.1 Authentication Endpoints

#### `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "confirmPassword": "SecureP@ss1",
  "firstName": "John",
  "lastName": "Doe",
  "countryCode": "+91",
  "contactNumber": "9876543210",
  "countryName": "India",
  "gender": "Male"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Responses:**
- `201` — Registration successful
- `400` — Validation error
- `409` — Email already exists

#### `POST /api/auth/login`

**Request Body (Email):**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Request Body (Phone):**
```json
{
  "countryCode": "+91",
  "contactNumber": "9876543210",
  "password": "SecureP@ss1"
}
```

**Responses:**
- `200` — Sets httpOnly cookies + returns `{ user: {...} }`
- `401` — Invalid credentials (generic message)
- `429` — Account locked

### 10.2 Resource Endpoints

All resource endpoints follow the **same pattern**:

| Method | URL | Access | Description |
|:-------|:----|:-------|:------------|
| `GET` | `/api/{resource}` | Any authenticated | List all records |
| `GET` | `/api/{resource}/:id` | Any authenticated | Get single record |
| `POST` | `/api/{resource}` | Role-dependent | Create new record |
| `PUT` | `/api/{resource}/:id` | Role-dependent | Update record |
| `DELETE` | `/api/{resource}/:id` | Admin/Manager | Delete record |

### 10.3 Health Check

```
GET /health

Response:
{
  "status": "healthy",       // or "degraded"
  "uptime": "2d 5h 30m",
  "database": "connected",   // or "disconnected"
  "memory": {
    "rss": "85 MB",
    "heap": "45 MB"
  },
  "version": "1.0.0",
  "timestamp": "2026-04-09T06:30:00.000Z"
}
```

---

## 11. Data Flow & Workflows

### 11.1 Lead-to-Client Conversion

This is the most critical business workflow in the system:

```
1. Lead is created (status: "New")
   │
2. Sales team qualifies the lead
   │  Status progresses: New → Hot/Warm/Cold
   │
3. Activities are logged against the lead
   │  (Calls, Emails, Meetings, Notes)
   │
4. Lead reaches "Hot" status — ready for conversion
   │
5. User clicks "Convert to Client" button
   │
   ▼
POST /api/leads/:id/convert
   │
   ├── Create new client record:
   │     company_name = lead.company
   │     contact_person = lead.name
   │     email = lead.email
   │     phone = lead.phone
   │     status = "Active"
   │
   ├── Update lead status:
   │     status = "Converted"
   │
   └── Return both client and updated lead
   │
6. Client appears in Clients module
   │
7. Deals, Projects, and Invoices can now be linked
```

### 11.2 Project Lifecycle

```
1. Client onboarded
   │
2. Create Project (linked to client)
   │  Status: "Planning"
   │
3. Assign handlers (multiple users with roles)
   │  PM: Project Manager
   │  DEV: Developer
   │  QA: Tester
   │
4. Create Tasks (linked to project + assigned users)
   │  Status progression: Pending → In Progress → Done
   │
5. Generate Invoices (linked to project)
   │  Status progression: Pending → Paid / Overdue
   │
6. Complete project
   │  Status: "Completed"
```

### 11.3 Request-Response Lifecycle

```
Browser Request
    │
    ▼
Vite Proxy (/api → localhost:5000)
    │
    ▼
Express Middleware Pipeline
    │
    ├── 1. UUID assigned to X-Request-Id
    ├── 2. Request logged (method, URL, IP)
    ├── 3. Security headers applied (Helmet)
    ├── 4. CORS origin validated
    ├── 5. Cookies parsed
    ├── 6. Body parsed (50KB limit)
    ├── 7. Rate limit checked
    ├── 8. JWT verified → req.user populated
    ├── 9. RBAC role checked
    ├── 10. Input validated + sanitized
    ├── 11. Controller logic executed
    ├── 12. Audit log entry written (async)
    │
    ▼
JSON Response (with X-Request-Id header)
    │
    ▼
Axios Response Interceptor
    │
    ├── 200-299: Return data
    ├── 401: Auto-refresh → retry
    └── Other: Throw to caller
```

---

## 12. Deployment & DevOps

### 12.1 Docker Compose Architecture

```yaml
services:
  db:        # PostgreSQL 16 Alpine
  backend:   # Express API (depends on db health)
  frontend:  # Vite dev server (depends on backend)
```

| Service | Port | Image | Health Check |
|:--------|:-----|:------|:-------------|
| `db` | 5432 | `postgres:16-alpine` | `pg_isready -U postgres -d CRM` |
| `backend` | 5000 | Custom Dockerfile | — |
| `frontend` | 5173 | Custom Dockerfile | — |

The database uses a **named volume** (`pgdata`) for persistence across container restarts. Migrations are mounted into `/docker-entrypoint-initdb.d` for automatic schema initialization.

### 12.2 Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### 12.3 Production Checklist

| Item | How |
|:-----|:----|
| ✅ Set `NODE_ENV=production` | Enables HTTPS redirect, strict CSP, secure cookies |
| ✅ Generate strong JWT secrets | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| ✅ Configure CORS origins | Set `CLIENT_URL` to production domain |
| ✅ Enable HTTPS | Use reverse proxy (Nginx) with SSL certificates |
| ✅ Build frontend | `npm run build` → serve `dist/` via Nginx |
| ✅ Set up database backups | `pg_dump -U postgres CRM > backup.sql` |
| ✅ Monitor health | Poll `GET /health` endpoint |
| ✅ Review audit logs | Query `audit_log` table for suspicious activity |

---

## 13. Development Workflow

### 13.1 Project Setup Sequence

```
1. Clone repository
2. npm install (root — installs concurrently)
3. cd backend && npm install
4. cd ../frontend && npm install
5. cp backend/.env.example backend/.env (+ edit credentials)
6. psql -U postgres -c "CREATE DATABASE CRM;"
7. npm run migrate
8. psql -U postgres -d CRM -f backend/seeds/seed.sql
9. npm run dev
```

### 13.2 Development Commands

| Task | Command |
|:-----|:--------|
| Start dev servers | `npm run dev` |
| Run migrations | `npm run migrate` |
| Check migration status | `npm run migrate:status` |
| Lint code | `npm run lint` |
| Build for production | `npm run build` |
| Create admin user | `node backend/scripts/create-admin.js` |
| Test RBAC permissions | `node backend/scripts/test-rbac.js` |
| Fix encoding issues | `node backend/scripts/fix-encoding.js` |

### 13.3 File Naming Conventions

| Pattern | Example | Location |
|:--------|:--------|:---------|
| `*.controller.js` | `leads.controller.js` | `backend/src/controllers/` |
| `*.model.js` | `leads.model.js` | `backend/src/models/` |
| `*.routes.js` | `leads.routes.js` | `backend/src/routes/` |
| `PascalCase.jsx` | `Dashboard.jsx` | `frontend/src/pages/` |
| `camelCase.js` | `useCrmData.js` | `frontend/src/hooks/` |
| `NNN_description.sql` | `001_initial_schema.sql` | `backend/migrations/` |

### 13.4 Adding a New Module

To add a new resource (e.g., "contacts"):

1. **Database:**
   - Create migration `backend/migrations/005_contacts.sql`
   - Run `npm run migrate`

2. **Backend:**
   - Create `backend/src/models/contacts.model.js`
   - Create `backend/src/controllers/contacts.controller.js`
   - Create `backend/src/routes/contacts.routes.js`
   - Mount in `backend/src/app.js`: `app.use("/api/contacts", auth, require("./routes/contacts.routes"))`

3. **Frontend:**
   - Create `frontend/src/pages/Contacts.jsx`
   - Add route in `frontend/src/App.jsx`
   - Add sidebar link in `frontend/src/components/AppSidebar.jsx`
   - Add endpoint in `frontend/src/data/fallbackData.js`

---

## 14. Appendix

### 14.1 Key File Size Analysis

| File | Size | Significance |
|:-----|:-----|:-------------|
| `frontend/src/styles/main.css` | 78 KB | Core application design system |
| `backend/seeds/seed.sql` | 35 KB | Complete development dataset |
| `frontend/src/pages/Leads.jsx` | 26 KB | Most complex page (conversion workflow) |
| `frontend/src/pages/Projects.jsx` | 26 KB | Multi-handler assignment complexity |
| `frontend/src/pages/Clients.jsx` | 23 KB | Full CRUD with notes |
| `frontend/src/pages/Deals.jsx` | 22 KB | Pipeline stage management |
| `frontend/src/pages/DashboardArtifact.jsx` | 22 KB | Standalone analytics preview |
| `frontend/src/pages/Dashboard.jsx` | 19 KB | KPI cards + charts |
| `backend/src/controllers/auth.controller.js` | 14 KB | Authentication logic (most complex controller) |

### 14.2 Dependency Tree

#### Backend (Production Dependencies)
```
├── cookie-parser    (HTTPS cookie handling)
├── cors             (Cross-origin resource sharing)
├── dotenv           (Environment variable loading)
├── express          (HTTP server framework)
├── express-rate-limit (Request throttling)
├── helmet           (Security headers)
├── jsonwebtoken     (JWT creation + verification)
├── pg               (PostgreSQL driver)
├── pino             (Structured logging)
├── pino-pretty      (Dev-mode log formatting)
└── uuid             (Request ID generation)
```

#### Frontend (Production Dependencies)
```
├── axios            (HTTP client)
├── react            (UI library)
├── react-dom        (DOM rendering)
└── react-router-dom (Client-side routing)
```

### 14.3 Environment Variable Reference

| Variable | Required | Default | Description |
|:---------|:---------|:--------|:------------|
| `PORT` | No | `5000` | Express server port |
| `NODE_ENV` | No | `development` | `development` / `production` |
| `DB_USER` | ✅ | — | PostgreSQL username |
| `DB_HOST` | ✅ | — | PostgreSQL hostname |
| `DB_NAME` | ✅ | — | Database name |
| `DB_PASSWORD` | ✅ | — | PostgreSQL password |
| `DB_PORT` | ✅ | `5432` | PostgreSQL port |
| `JWT_SECRET` | ✅ | — | Access token signing key |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token signing key |
| `JWT_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origins (comma-separated) |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret (optional) |

---

> **Document End**  
> This document provides a complete technical reference for the AstrawinCRM platform.  
> For quick-start instructions, see [README.md](file:///c:/Users/ksrsu/Downloads/crm-app/README.md).
