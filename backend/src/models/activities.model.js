const pool = require("../config/db");

const createActivity = async (data) => {
  const { lead_id, type, notes } = data;

  const result = await pool.query(
    `INSERT INTO activities (lead_id, type, notes)
     VALUES ($1,$2,$3) RETURNING *`,
    [lead_id, type, notes]
  );

  return result.rows[0];
};

const getActivities = async () => {
  const result = await pool.query("SELECT * FROM activities");
  return result.rows;
};

module.exports = { createActivity, getActivities };