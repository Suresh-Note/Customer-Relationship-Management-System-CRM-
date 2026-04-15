// starter file
const pool = require("../config/db");

const createProject = async (data) => {
  const { project_name, service_type, client_id, start_date, end_date, status } = data;

  const result = await pool.query(
    `INSERT INTO projects (project_name, service_type, client_id, start_date, end_date, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [project_name, service_type, client_id, start_date, end_date, status]
  );

  return result.rows[0];
};

const getProjects = async () => {
  const result = await pool.query("SELECT * FROM projects");
  return result.rows;
};

module.exports = { createProject, getProjects };