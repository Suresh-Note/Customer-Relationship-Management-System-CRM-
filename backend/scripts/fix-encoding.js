require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || "CRM",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "Admin6",
  options:  "-c client_encoding=UTF8",
});

// chr(226)||chr(8364)||chr(8221) = the garbled â€" stored in DB
const BAD  = "chr(226)||chr(8364)||chr(8221)";
const GOOD = "' - '";

async function fix() {
  const tables = [
    { table: "tasks",      cols: ["task_name", "description"] },
    { table: "projects",   cols: ["project_name"] },
    { table: "deals",      cols: ["deal_name"] },
    { table: "activities", cols: ["notes"] },
    { table: "leads",      cols: ["service_interest"] },
    { table: "clients",    cols: ["company_name"] },
  ];

  for (const { table, cols } of tables) {
    for (const col of cols) {
      const res = await pool.query(
        `UPDATE ${table} SET ${col} = replace(${col}, ${BAD}, ${GOOD})
         WHERE ${col} LIKE '%' || ${BAD} || '%'
         RETURNING ${col}`
      );
      if (res.rowCount > 0)
        console.log(`✅ Fixed ${res.rowCount} row(s) in ${table}.${col}`);
    }
  }

  console.log("\n✅ Encoding fix complete!");
  await pool.end();
}

fix().catch(err => { console.error("❌", err.message); process.exit(1); });
