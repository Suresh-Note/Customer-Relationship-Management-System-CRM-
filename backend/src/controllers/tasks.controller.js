const pool = require("../config/db");
const { validate, bad, TASK_STATUSES, PRIORITY } = require("../middleware/validate");

exports.createTask = async (req, res, next) => {
  try {
    const { task_name, project_id, assigned_to, deadline, status = "Pending", priority = "Medium", description } = req.body;
    const errs = validate(req.body, {
      task_name: { required: true },
      status:    { enum: TASK_STATUSES },
      priority:  { enum: PRIORITY },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `INSERT INTO tasks (task_name, project_id, assigned_to, deadline, status, priority, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [task_name.trim(), project_id||null, assigned_to||null, deadline||null, status, priority, description||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, project_id, assigned_to } = req.query;
    let q = `SELECT t.*, u.name AS assigned_to_name, p.project_name
             FROM tasks t
             LEFT JOIN users u    ON u.user_id    = t.assigned_to
             LEFT JOIN projects p ON p.project_id = t.project_id
             WHERE 1=1`;
    const params = [];
    if (status && status !== "All")    { params.push(status);   q += ` AND t.status=$${params.length}`; }
    if (priority && priority !== "All"){ params.push(priority); q += ` AND t.priority=$${params.length}`; }
    if (project_id)                    { params.push(project_id);  q += ` AND t.project_id=$${params.length}`; }
    if (assigned_to)                   { params.push(assigned_to); q += ` AND t.assigned_to=$${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND t.task_name ILIKE $${params.length}`; }
    q += " ORDER BY t.task_id DESC";
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name AS assigned_to_name FROM tasks t
       LEFT JOIN users u ON u.user_id = t.assigned_to WHERE t.task_id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { task_name, project_id, assigned_to, deadline, status, priority, description } = req.body;
    const errs = validate(req.body, {
      task_name: { required: true },
      status:    { required: true, enum: TASK_STATUSES },
      priority:  { required: true, enum: PRIORITY },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `UPDATE tasks SET task_name=$1, project_id=$2, assigned_to=$3, deadline=$4,
       status=$5, priority=$6, description=$7 WHERE task_id=$8 RETURNING *`,
      [task_name.trim(), project_id||null, assigned_to||null, deadline||null, status, priority, description||null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM tasks WHERE task_id=$1 RETURNING task_id, task_name", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};
