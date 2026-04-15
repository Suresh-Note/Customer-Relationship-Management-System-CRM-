require("dotenv").config();
const { Pool } = require("pg");
const { hashPassword } = require("../src/utils/password");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || "CRM",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "Admin6",
});

async function run() {
  const email = "ksrsuresh123@gmail.com";
  const pass = "Ksrsuresh@123";
  const hash = hashPassword(pass);

  try {
    const res = await pool.query(
      "INSERT INTO users (first_name, last_name, name, email, password, role, login_attempts, locked_until) VALUES ($1, $2, $3, $4, $5, $6, 0, NULL) ON CONFLICT (email) DO UPDATE SET password=$5, role=$6, login_attempts=0, locked_until=NULL RETURNING email, role",
      ["Suresh", "KSR", "Suresh KSR", email, hash, "Admin"]
    );
    console.log("Account created/unlocked successfully:", res.rows[0]);
  } catch (err) {
    console.error("Error creating account:", err);
  } finally {
    await pool.end();
  }
}

run();
