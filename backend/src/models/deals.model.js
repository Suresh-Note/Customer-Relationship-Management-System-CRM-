// starter file
const pool = require("../config/db");

const createDeal = async (data) => {
  const { deal_name, value, stage, lead_id } = data;

  const result = await pool.query(
    `INSERT INTO deals (deal_name, value, stage, lead_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [deal_name, value, stage, lead_id]
  );

  return result.rows[0];
};

const getDeals = async () => {
  const result = await pool.query("SELECT * FROM deals");
  return result.rows;
};

module.exports = { createDeal, getDeals };