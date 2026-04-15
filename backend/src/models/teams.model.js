const pool = require("../config/db");

const createTeam = async (data) => {
  const { team_name, description } = data;

  const result = await pool.query(
    `INSERT INTO teams (team_name, description)
     VALUES ($1,$2) RETURNING *`,
    [team_name, description]
  );

  return result.rows[0];
};

const getTeams = async () => {
  const result = await pool.query("SELECT * FROM teams");
  return result.rows;
};

module.exports = { createTeam, getTeams };