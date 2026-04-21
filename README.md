<p align="center">
  <img src="https://img.shields.io/badge/AstrawinCRM-Enterprise%20CRM-6C63FF?style=for-the-badge" alt="AstrawinCRM"/>
</p>

<h1 align="center">AstrawinCRM</h1>

<p align="center">
  <strong>A full-stack, enterprise-grade Customer Relationship Management platform</strong><br/>
  Built with React · Express · PostgreSQL
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/react-18.2-61DAFB?style=flat-square&logo=react" alt="React 18"/>
  <img src="https://img.shields.io/badge/express-4.x-000000?style=flat-square&logo=express" alt="Express 4"/>
  <img src="https://img.shields.io/badge/postgresql-16-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker" alt="Docker"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Database Schema](#-database-schema)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**AstrawinCRM** is a comprehensive CRM platform designed to manage the full customer lifecycle — from lead capture through deal closure, project delivery, and invoicing. It features a modern React frontend with a premium glassmorphism UI, a secure Express REST API backend, and a PostgreSQL database with versioned migrations.

The system supports **role-based access control (RBAC)** with six distinct user roles, ensuring that administrators, managers, and team members each see only the data and actions relevant to their responsibilities.

---

## ✨ Key Features

### 🎯 Sales Pipeline Management
- **Lead Tracking** — Capture, categorize (New / Hot / Warm / Cold), and assign leads to team members
- **Lead → Client Conversion** — Single-click workflow to convert qualified leads into active clients
- **Deal Pipeline** — Track deals through stages: Prospecting → Qualified → Proposal → Negotiation → Closed Won
- **Activity Logging** — Record calls, emails, meetings, notes, and tasks against leads

### 📊 Project & Task Management
- **Project Lifecycle** — Manage projects from Planning → Active → On Hold → Completed
- **Multi-Handler Assignment** — Assign multiple team members to projects with specific roles
- **Task Board** — Create, assign, and track tasks with priorities (Low / Medium / High) and deadlines
- **Client Linking** — All projects are linked to clients for full traceability

### 💰 Financial Management
- **Invoice Generation** — Create and track invoices tied to projects
- **Payment Status** — Monitor Pending, Paid, and Overdue invoices
- **Revenue Dashboard** — Real-time financial overview with visual analytics

### 👥 Team & User Management
- **Team Organization** — Create teams and assign members
- **Role-Based Access Control** — Six roles: `Admin`, `Manager`, `Sales`, `Developer`, `Marketing`, `User`
- **User Profiles** — Complete profiles with international phone numbers and country data

### 📈 Analytics Dashboard
- **Real-Time Metrics** — Live KPIs for leads, deals, revenue, and team performance
- **Visual Charts** — Interactive data visualizations for pipeline and financial analysis
- **API Health Monitoring** — Built-in health check with database status, uptime, and memory usage

### 🔐 Enterprise Security
- **JWT Authentication** — Access + refresh token rotation with httpOnly secure cookies
- **Account Protection** — Lockout after 5 failed attempts, password complexity enforcement
- **XSS Prevention** — Input sanitization, HTML stripping, and Content Security Policy
- **SQL Injection Protection** — Parameterized queries throughout the entire data layer
- **Audit Trail** — All sensitive operations logged with user, IP, and before/after snapshots

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | React 18 + Vite 5 | Component-based SPA with HMR |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **Routing** | React Router 6 | Client-side routing with protected routes |
| **HTTP Client** | Axios | API communication with auto-refresh interceptors |
| **Backend** | Express 4 | RESTful API with middleware pipeline |
| **Database** | PostgreSQL 16 | Relational storage with connection pooling |
| **Auth** | JWT + httpOnly Cookies | Stateless auth with secure token rotation |
| **Logging** | Pino | Structured JSON logging (production) / pretty (dev) |
| **Security** | Helmet + CORS + Rate Limiting | Defense-in-depth HTTP security |
| **Containerization** | Docker + Docker Compose | One-command full-stack deployment |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                     React 18 + Vite + Tailwind                  │
│              ┌───────────────────────────────────┐              │
│              │  AuthContext ──► ProtectedRoute   │              │
│              │  useCrmData  ──► Dashboard / Pages│              │
│              │  Axios ──────►  Auto Token Refresh│              │
│              └───────────────┬───────────────────┘              │
└──────────────────────────────┼──────────────────────────────────┘
                               │  HTTP (REST + httpOnly cookies)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API SERVER (Express 4)                     │
│                                                                 │
│  CORS → Helmet + CSP → Rate Limit → Auth + JWT → Controllers    │
│                                         │                       │
│                   Audit Logger ◄── RBAC Guard                   │
└──────────────────────────────┼──────────────────────────────────┘
                               │  pg (connection pool, max: 20)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16 (Alpine)                       │
│                                                                 │
│  Tables: users · teams · leads · clients · deals · projects     │
│          tasks · invoices · activities · refresh_tokens         │
│          lead_notes · client_notes · project_handlers           │
│          audit_log                                              │
│                                                                 │
│  Features: CHECK constraints · ON DELETE cascading              │
│            Indexed foreign keys · UTF-8 encoding                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:------------|:--------|
| [Node.js](https://nodejs.org/) | 18.0+ |
| [PostgreSQL](https://www.postgresql.org/) | 14.0+ |
| [Docker](https://www.docker.com/) *(optional)* | 20.0+ |

### Option 1: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Suresh-Note/Customer-Relationship-Management-System-CRM-.git
cd Customer-Relationship-Management-System-CRM-

# 2. Install dependencies (root, backend, and frontend)
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials and JWT secrets

# 4. Create the database
psql -U postgres -c "CREATE DATABASE CRM;"

# 5. Run database migrations
npm run migrate

# 6. (Optional) Seed with sample data — 100 clients, leads, projects, etc.
psql -U postgres -d CRM -f backend/seeds/seed.sql

# 7. Start the development servers
npm run dev
```

### Option 2: Docker (One Command)

```bash
docker compose up
```

This spins up PostgreSQL, the backend API, and the Vite frontend with hot-reload — all pre-configured.

### Option 3: Windows Quick Start

Double-click `start-crm.bat` to launch both servers and open the browser automatically.

### Access the Application

| Service | URL |
|:--------|:----|
| 🌐 Frontend | [http://localhost:5173](http://localhost:5173) |
| 🔌 Backend API | [http://localhost:5000](http://localhost:5000) |
| 💚 Health Check | [http://localhost:5000/health](http://localhost:5000/health) |

### Default Admin Credentials

After seeding, you can log in with the admin account created by the seed script. Check `backend/seeds/seed.sql` for the default credentials, or create a new admin:

```bash
node backend/scripts/create-admin.js
```

---

## 📁 Project Structure

```
AstrawinCRM/
├── docker-compose.yml              # Full-stack containerized environment
├── package.json                    # Root scripts (dev, build, lint, migrate)
├── start-crm.bat                   # Windows one-click launcher
├── .prettierrc                     # Shared code formatting rules
│
├── backend/
│   ├── server.js                   # Entry point (env validation, graceful shutdown)
│   ├── schema.sql                  # Full database schema reference
│   ├── Dockerfile                  # Production container image
│   ├── .env.example                # Environment variable template
│   │
│   ├── migrations/                 # Versioned schema changes
│   ├── seeds/                      # Development data
│   ├── scripts/                    # Maintenance utilities
│   │
│   └── src/
│       ├── app.js                  # Express app (middleware stack)
│       ├── config/                 # DB, env, logger, migration runner
│       ├── controllers/            # Business logic (10 modules)
│       ├── middleware/             # Auth, RBAC, validation, audit, errors
│       ├── models/                 # Data access layer (8 modules)
│       └── routes/                 # Express route definitions (10 files)
│
└── frontend/
    ├── index.html                  # SPA entry point
    ├── vite.config.js              # Build config + API proxy + code splitting
    ├── tailwind.config.js          # Design system tokens
    ├── Dockerfile                  # Container image
    │
    └── src/
        ├── App.jsx                 # Root component + route definitions
        ├── api/                    # Axios instance + auto token refresh
        ├── components/             # Layout, sidebar, RBAC, cards, workspace
        ├── context/                # AuthContext (session management)
        ├── hooks/                  # useCrmData, useAuth, useIdleTimeout
        ├── pages/                  # 12 page components
        ├── styles/                 # Main, auth, Tailwind CSS
        └── utils/                  # Auth storage, RBAC, notifications
```

---

## 📡 API Reference

All API endpoints return JSON. Protected routes require a valid JWT access token (sent automatically via httpOnly cookies).

### Authentication

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/auth/register` | — | Create a new user account |
| `POST` | `/api/auth/login` | — | Authenticate and receive session cookies |
| `POST` | `/api/auth/refresh` | 🍪 Cookie | Rotate access + refresh tokens |
| `POST` | `/api/auth/logout` | 🍪 Cookie | Revoke refresh token and clear cookies |
| `GET`  | `/api/auth/me` | 🔒 JWT | Get current authenticated user profile |

### Core Resources

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `GET` | `/api/leads` | 🔒 JWT | List all leads |
| `POST` | `/api/leads` | 🔒 JWT | Create a new lead |
| `GET` | `/api/leads/:id` | 🔒 JWT | Get lead details with notes |
| `PUT` | `/api/leads/:id` | 🔒 JWT | Update a lead |
| `DELETE` | `/api/leads/:id` | 🔒 RBAC | Delete a lead (Admin/Manager only) |
| `POST` | `/api/leads/:id/convert` | 🔒 JWT | Convert lead → client |
| `GET` | `/api/clients` | 🔒 JWT | List all clients |
| `POST` | `/api/clients` | 🔒 JWT | Create a new client |
| `PUT` | `/api/clients/:id` | 🔒 JWT | Update a client |
| `DELETE` | `/api/clients/:id` | 🔒 RBAC | Delete a client (Admin/Manager only) |
| `GET` | `/api/deals` | 🔒 JWT | List all deals |
| `POST` | `/api/deals` | 🔒 JWT | Create a new deal |
| `PUT` | `/api/deals/:id` | 🔒 JWT | Update a deal |
| `DELETE` | `/api/deals/:id` | 🔒 RBAC | Delete a deal (Admin/Manager only) |
| `GET` | `/api/projects` | 🔒 JWT | List all projects (with handlers) |
| `POST` | `/api/projects` | 🔒 JWT | Create a new project |
| `PUT` | `/api/projects/:id` | 🔒 JWT | Update a project |
| `DELETE` | `/api/projects/:id` | 🔒 RBAC | Delete a project |
| `GET` | `/api/tasks` | 🔒 JWT | List all tasks |
| `POST` | `/api/tasks` | 🔒 JWT | Create a new task |
| `PUT` | `/api/tasks/:id` | 🔒 JWT | Update a task |
| `DELETE` | `/api/tasks/:id` | 🔒 RBAC | Delete a task |
| `GET` | `/api/invoices` | 🔒 JWT | List all invoices |
| `POST` | `/api/invoices` | 🔒 JWT | Create an invoice |
| `PUT` | `/api/invoices/:id` | 🔒 JWT | Update an invoice |
| `DELETE` | `/api/invoices/:id` | 🔒 RBAC | Delete an invoice |
| `GET` | `/api/activities` | 🔒 JWT | List all activities |
| `POST` | `/api/activities` | 🔒 JWT | Log a new activity |
| `GET` | `/api/teams` | 🔒 JWT | List all teams |
| `POST` | `/api/teams` | 🔒 RBAC | Create a team (Admin/Manager) |
| `GET` | `/api/users` | 🔒 JWT | List all users |
| `PUT` | `/api/users/:id` | 🔒 JWT | Update user profile |

### System

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `GET` | `/health` | — | Health check (DB status, uptime, memory, version) |
| `GET` | `/` | — | API status message |

---

## 🔐 Security

AstrawinCRM implements defense-in-depth with multiple security layers:

| Feature | Implementation |
|:--------|:---------------|
| **Password Hashing** | Node.js `scrypt` with timing-safe comparison |
| **Token Strategy** | JWT access (15min) + refresh (30 days) token rotation |
| **Cookie Security** | `httpOnly`, `secure` (prod), `sameSite: strict` — no tokens in localStorage |
| **Account Lockout** | 5 failed attempts → 15-minute lockout |
| **Password Policy** | Min 8 chars, uppercase, lowercase, number, special character |
| **Rate Limiting** | Global: 500 req/15min · Auth: 20 req/15min |
| **HTTP Headers** | Helmet with CSP, X-Frame-Options, HSTS (production) |
| **CORS** | Whitelist-based origin validation |
| **Input Sanitization** | HTML tag stripping, XSS pattern removal on all string inputs |
| **SQL Injection** | 100% parameterized queries via `pg` — zero string concatenation |
| **RBAC** | 6-tier role hierarchy with rank-based permission checks |
| **Audit Logging** | Fire-and-forget `audit_log` entries (user, action, entity, IP, before/after) |
| **Request IDs** | UUID per request for end-to-end log correlation |
| **Idle Timeout** | Auto-logout on frontend inactivity |
| **Graceful Shutdown** | Clean DB pool teardown on SIGTERM/SIGINT |

---

## 🗃 Database Schema

The database consists of **14 tables** with foreign key relationships and CHECK constraints:

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│  teams   │◄────│   users   │────►│  leads   │────►│activities│
└──────────┘     └─────┬─────┘     └────┬─────┘     └──────────┘
                       │                │
                       │           ┌────▼─────┐     ┌──────────┐
                       │           │ clients  │────►│  deals   │
                       │           └────┬─────┘     └──────────┘
                       │                │
                       │           ┌────▼──────┐    ┌──────────┐
                       └──────────►│ projects  │───►│ invoices │
                                   └────┬──────┘    └──────────┘
                                        │
                                   ┌────▼─────┐
                                   │  tasks   │
                                   └──────────┘

Supporting: lead_notes · client_notes · project_handlers
            refresh_tokens · audit_log
```

---

## 📜 Available Scripts

Run all scripts from the **project root**:

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start backend + frontend concurrently with hot-reload |
| `npm run build` | Build the frontend for production |
| `npm run lint` | Lint both backend and frontend code |
| `npm run migrate` | Apply pending database migrations |
| `npm run migrate:status` | Show current migration status |
| `npm start` | Start backend in production mode |

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Required | Default | Description |
|:---------|:---------|:--------|:------------|
| `PORT` | No | `5000` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `DB_USER` | ✅ | — | PostgreSQL username |
| `DB_HOST` | ✅ | — | PostgreSQL host |
| `DB_NAME` | ✅ | — | Database name (e.g., `CRM`) |
| `DB_PASSWORD` | ✅ | — | PostgreSQL password |
| `DB_PORT` | ✅ | `5432` | PostgreSQL port |
| `JWT_SECRET` | ✅ | — | Access token signing key (64+ chars recommended) |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token signing key (64+ chars recommended) |
| `JWT_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifetime |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin(s) |

> 💡 **Generate secure secrets:** `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 🐳 Deployment

### Docker Compose (Recommended for Development)

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Stop all services
docker compose down

# Reset database (removes volume)
docker compose down -v
```

### Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use strong, unique JWT secrets (64+ characters)
3. Enable HTTPS (the app auto-redirects HTTP → HTTPS in production)
4. Configure `CLIENT_URL` to your production frontend domain
5. Build the frontend: `npm run build`
6. Serve the frontend dist via Nginx or similar reverse proxy

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Suresh Kanchamreddy**

[![GitHub](https://img.shields.io/badge/GitHub-Suresh--Note-181717?style=flat-square&logo=github)](https://github.com/Suresh-Note)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/suresh-kanchamreddy)

---

<p align="center">Built with ❤️ by Suresh Kanchamreddy</p>

