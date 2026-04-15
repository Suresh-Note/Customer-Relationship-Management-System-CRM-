const pool = require("../config/db");

const createTask = async (data) => {
  const { task_name, assigned_to, project_id, deadline, status } = data;

  const result = await pool.query(
    `INSERT INTO tasks (task_name, assigned_to, project_id, deadline, status)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [task_name, assigned_to, project_id, deadline, status]
  );

  return result.rows[0];
};

const getTasks = async () => {
  const result = await pool.query("SELECT * FROM tasks");
  return result.rows;
};

module.exports = { createTask, getTasks };