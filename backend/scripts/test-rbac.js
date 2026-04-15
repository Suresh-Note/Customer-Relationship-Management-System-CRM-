/**
 * RBAC Demo — Plain text output for Windows console
 * (Buffers all output and prints at the end to prevent terminal tearing)
 */
require("dotenv").config();
const http = require("http");
const { Pool } = require("pg");
const { hashPassword } = require("../src/utils/password");

const API = "http://localhost:5000";
let outputBuffer = [];

function log(msg) {
  outputBuffer.push(msg);
}

function req(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API);
    const opts = {
      hostname: url.hostname, port: url.port, path: url.pathname,
      method, headers: { "Content-Type": "application/json" },
    };
    if (cookie) opts.headers.Cookie = cookie;
    const r = http.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(d || "{}"), cookies: (res.headers["set-cookie"] || []).join("; ") }));
    });
    r.on("error", reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function login(email, pw) {
  const r = await req("POST", "/api/auth/login", { email, password: pw });
  return r.status === 200 ? { ok: true, user: r.body.user, cookie: r.cookies } : { ok: false };
}

async function testRole(role, email, pw) {
  log(`\n====== ${role.toUpperCase()} (${email}) ======`);
  const s = await login(email, pw);
  if (!s.ok) { log("  [FAIL] Login failed"); return; }
  log(`  Logged in as ${s.user.name} (${s.user.role})\n`);

  const tests = [
    ["GET",    "/api/leads",          "Read leads",              null],
    ["GET",    "/api/clients",        "Read clients",            null],
    ["GET",    "/api/invoices",       "Read invoices",           null],
    ["POST",   "/api/leads",          "Create lead",             { name: "Test", email: "t@t.com", company: "T" }],
    ["POST",   "/api/invoices",       "Create invoice",          { amount: 1000 }],
    ["POST",   "/api/teams",          "Create team",             { team_name: "RBAC Test" }],
    ["DELETE", "/api/leads/9999",     "Delete lead",             null],
    ["DELETE", "/api/invoices/9999",  "Delete invoice",          null],
    ["DELETE", "/api/teams/9999",     "Delete team",             null],
    ["PUT",    "/api/users/1",        "Update other user role",  { role: "User" }],
  ];

  for (const [method, path, label, body] of tests) {
    const r = await req(method, path, body, s.cookie);
    const st = r.status;
    const tag = st === 403 ? "DENIED " : st === 401 ? "NO-AUTH" : st === 404 ? "OK(404)" : (st >= 200 && st < 300) ? "ALLOWED" : `ERR${st} `;
    let mark = "    ";
    if (st === 403) mark = "[X] ";
    else if (st >= 200 && st < 400) mark = "[OK]";
    else if (st === 404) mark = "[!!]";

    log(`  ${mark} ${method.padEnd(6)} ${label.padEnd(28)} => ${st} ${tag}`);
  }
}

async function main() {
  log("============================================================");
  log("  RBAC (Role-Based Access Control) DEMO");
  log("  Roles: Admin(4) > Manager(3) > Sales/Dev/Mktg(2) > User(1)");
  log("============================================================");

  const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_NAME, password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  const testPw = "RbacTest@1234!";
  const hashed = hashPassword(testPw);

  const users = [
    { email: "rbac_user@test.com",    role: "User",    name: "Test User" },
    { email: "rbac_sales@test.com",   role: "Sales",   name: "Test Sales" },
    { email: "rbac_mgr@test.com",     role: "Manager", name: "Test Manager" },
    { email: "rbac_admin@test.com",   role: "Admin",   name: "Test Admin" },
  ];

  log("\nCreating test users...");
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET password=$3, role=$4`,
      [u.name, u.email, hashed, u.role]
    );
  }

  for (const u of users) {
    await testRole(u.role, u.email, testPw);
  }

  log("\nCleaning up test users...");
  await pool.query("DELETE FROM refresh_tokens WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE 'rbac_%@test.com')");
  await pool.query("DELETE FROM leads WHERE name='Test' AND email='t@t.com'");
  await pool.query("DELETE FROM teams WHERE team_name='RBAC Test'");
  await pool.query("DELETE FROM invoices WHERE amount=1000");
  await pool.query("DELETE FROM users WHERE email LIKE 'rbac_%@test.com'");
  log("Done - test data cleaned up.");

  await pool.end();
  log("\nRBAC demo complete!\n");
  
  // Print everything exactly once to prevent line-tearing in PowerShell
  console.log(outputBuffer.join("\n"));
}

main().catch(err => {
  console.error("Fatal Error:");
  console.error(err);
});
