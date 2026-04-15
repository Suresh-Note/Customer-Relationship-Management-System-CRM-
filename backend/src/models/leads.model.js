// starter file
const pool = require("../config/db");

const createLead = async (data) => {
  const { name, email, phone, company, source, status } = data;

  const result = await pool.query(
    `INSERT INTO leads (name, email, phone, company, source, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, email, phone, company, source, status || "New"]
  );

  return result.rows[0];
};

const getLeads = async () => {
  const result = await pool.query("SELECT * FROM leads ORDER BY created_at DESC");
  return result.rows;
};

module.exports = { createLead, getLeads };