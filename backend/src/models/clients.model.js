const pool = require("../config/db");

const createClient = async (data) => {
  const { company_name, contact_person, email, phone } = data;

  const result = await pool.query(
    `INSERT INTO clients (company_name, contact_person, email, phone)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [company_name, contact_person, email, phone]
  );

  return result.rows[0];
};

const getClients = async () => {
  const result = await pool.query("SELECT * FROM clients");
  return result.rows;
};

module.exports = { createClient, getClients };