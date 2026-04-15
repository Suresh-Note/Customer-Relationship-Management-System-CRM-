const pool = require("../config/db");

const createInvoice = async (data) => {
  const { project_id, amount, status, issued_date, due_date } = data;

  const result = await pool.query(
    `INSERT INTO invoices (project_id, amount, status, issued_date, due_date)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [project_id, amount, status, issued_date, due_date]
  );

  return result.rows[0];
};

const getInvoices = async () => {
  const result = await pool.query("SELECT * FROM invoices");
  return result.rows;
};

module.exports = { createInvoice, getInvoices };