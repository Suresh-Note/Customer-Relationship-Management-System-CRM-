-- Migration 001: Initial Schema
-- Applied from schema.sql — the core AstrawinCRM tables

CREATE TABLE IF NOT EXISTS teams (
  team_id     SERIAL PRIMARY KEY,
  team_name   VARCHAR(150) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  user_id         SERIAL PRIMARY KEY,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  name            VARCHAR(150),
  email           VARCHAR(150) NOT NULL UNIQUE,
  password        TEXT         NOT NULL,
  role            VARCHAR(50)  NOT NULL DEFAULT 'User'
                    CHECK (role IN ('Admin','Manager','Sales','Developer','Marketing','User')),
  team_id         INT REFERENCES teams(team_id) ON DELETE SET NULL,
  country_code    VARCHAR(10),
  country_name    VARCHAR(120),
  contact_number  VARCHAR(30) UNIQUE,
  gender          VARCHAR(20),
  login_attempts  INT NOT NULL DEFAULT 0,
  locked_until    TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  lead_id          SERIAL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  email            VARCHAR(150),
  phone            VARCHAR(30),
  company          VARCHAR(150),
  source           VARCHAR(50),
  service_interest VARCHAR(100),
  status           VARCHAR(30) NOT NULL DEFAULT 'New'
                     CHECK (status IN ('New','Hot','Warm','Cold','Converted')),
  assigned_to      INT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  client_id      SERIAL PRIMARY KEY,
  company_name   VARCHAR(150) NOT NULL,
  contact_person VARCHAR(150),
  email          VARCHAR(150),
  phone          VARCHAR(30),
  status         VARCHAR(30) NOT NULL DEFAULT 'Active'
                   CHECK (status IN ('Active','On hold','Inactive')),
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deals (
  deal_id         SERIAL PRIMARY KEY,
  deal_name       VARCHAR(150) NOT NULL,
  value           NUMERIC(14,2) NOT NULL DEFAULT 0,
  stage           VARCHAR(50) NOT NULL DEFAULT 'Prospecting'
                    CHECK (stage IN ('Prospecting','Qualified','Proposal','Negotiation','Closed Won')),
  probability     INT CHECK (probability BETWEEN 0 AND 100),
  expected_close  DATE,
  lead_id         INT REFERENCES leads(lead_id) ON DELETE SET NULL,
  client_id       INT REFERENCES clients(client_id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  project_id   SERIAL PRIMARY KEY,
  project_name VARCHAR(150) NOT NULL,
  service_type VARCHAR(100),
  client_id    INT REFERENCES clients(client_id) ON DELETE SET NULL,
  start_date   DATE,
  end_date     DATE,
  status       VARCHAR(30) NOT NULL DEFAULT 'Planning'
                 CHECK (status IN ('Planning','Active','On Hold','Completed')),
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_handlers (
  project_id  INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(user_id)       ON DELETE CASCADE,
  role        VARCHAR(80) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_project_handlers_project ON project_handlers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_handlers_user    ON project_handlers(user_id);

CREATE TABLE IF NOT EXISTS tasks (
  task_id     SERIAL PRIMARY KEY,
  task_name   VARCHAR(150) NOT NULL,
  description TEXT,
  project_id  INT REFERENCES projects(project_id) ON DELETE SET NULL,
  assigned_to INT REFERENCES users(user_id) ON DELETE SET NULL,
  deadline    DATE,
  status      VARCHAR(30) NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending','In Progress','Done')),
  priority    VARCHAR(20) NOT NULL DEFAULT 'Medium'
                CHECK (priority IN ('Low','Medium','High')),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  invoice_id  SERIAL PRIMARY KEY,
  project_id  INT REFERENCES projects(project_id) ON DELETE SET NULL,
  amount      NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  status      VARCHAR(30) NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending','Paid','Overdue')),
  issued_date DATE,
  due_date    DATE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  activity_id   SERIAL PRIMARY KEY,
  lead_id       INT REFERENCES leads(lead_id) ON DELETE SET NULL,
  type          VARCHAR(30) NOT NULL
                  CHECK (type IN ('Call','Email','Meeting','Note','Task')),
  notes         TEXT,
  activity_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_id    SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user  ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
