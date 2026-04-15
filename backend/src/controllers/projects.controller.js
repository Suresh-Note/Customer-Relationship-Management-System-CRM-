const pool = require("../config/db");
const { validate, bad, PROJECT_STATUSES } = require("../middleware/validate");

// Normalise an incoming handlers payload to [{user_id, role}]
function normaliseHandlers(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  const seen = new Set();
  for (const h of input) {
    if (!h) continue;
    const user_id = Number(h.user_id);
    const role    = (h.role || "").toString().trim();
    if (!user_id || !role) continue;
    const key = `${user_id}|${role.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ user_id, role });
  }
  return out;
}

async function replaceHandlers(client, projectId, handlers) {
  await client.query("DELETE FROM project_handlers WHERE project_id=$1", [projectId]);
  for (const h of handlers) {
    await client.query(
      "INSERT INTO project_handlers (project_id, user_id, role) VALUES ($1,$2,$3)",
      [projectId, h.user_id, h.role]
    );
  }
}

async function fetchHandlers(projectIds) {
  if (!projectIds.length) return {};
  const result = await pool.query(
    `SELECT ph.project_id, ph.user_id, ph.role,
            COALESCE(u.name, CONCAT_WS(' ', u.first_name, u.last_name), u.email) AS user_name,
            u.email
       FROM project_handlers ph
       JOIN users u ON u.user_id = ph.user_id
      WHERE ph.project_id = ANY($1::int[])
      ORDER BY ph.role, user_name`,
    [projectIds]
  );
  const map = {};
  for (const r of result.rows) {
    if (!map[r.project_id]) map[r.project_id] = [];
    map[r.project_id].push({
      user_id:   r.user_id,
      role:      r.role,
      user_name: r.user_name,
      email:     r.email,
    });
  }
  return map;
}

exports.createProject = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { project_name, service_type, client_id, start_date, end_date, status = "Planning", handlers } = req.body;
    const errs = validate(req.body, {
      project_name: { required: true },
      status:       { enum: PROJECT_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const cleanHandlers = normaliseHandlers(handlers);

    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO projects (project_name, service_type, client_id, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [project_name.trim(), service_type||null, client_id||null, start_date||null, end_date||null, status]
    );
    const project = result.rows[0];
    await replaceHandlers(client, project.project_id, cleanHandlers);
    await client.query("COMMIT");

    const map = await fetchHandlers([project.project_id]);
    project.handlers = map[project.project_id] || [];
    res.status(201).json(project);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let q = `SELECT p.*, c.company_name AS client_name FROM projects p
             LEFT JOIN clients c ON c.client_id = p.client_id WHERE 1=1`;
    const params = [];
    if (status && status !== "All") { params.push(status); q += ` AND p.status=$${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND (p.project_name ILIKE $${params.length} OR p.service_type ILIKE $${params.length})`; }
    q += " ORDER BY p.project_id DESC";
    const result = await pool.query(q, params);
    const rows = result.rows;
    const map = await fetchHandlers(rows.map(r => r.project_id));
    for (const r of rows) r.handlers = map[r.project_id] || [];
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.company_name AS client_name FROM projects p
       LEFT JOIN clients c ON c.client_id = p.client_id WHERE p.project_id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Project not found" });
    const project = result.rows[0];
    const map = await fetchHandlers([project.project_id]);
    project.handlers = map[project.project_id] || [];
    res.json(project);
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { project_name, service_type, client_id, start_date, end_date, status, handlers } = req.body;
    const errs = validate(req.body, {
      project_name: { required: true },
      status:       { required: true, enum: PROJECT_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const cleanHandlers = normaliseHandlers(handlers);

    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE projects SET project_name=$1, service_type=$2, client_id=$3,
       start_date=$4, end_date=$5, status=$6 WHERE project_id=$7 RETURNING *`,
      [project_name.trim(), service_type||null, client_id||null, start_date||null, end_date||null, status, id]
    );
    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Project not found" });
    }
    await replaceHandlers(client, id, cleanHandlers);
    await client.query("COMMIT");

    const project = result.rows[0];
    const map = await fetchHandlers([project.project_id]);
    project.handlers = map[project.project_id] || [];
    res.json(project);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM projects WHERE project_id=$1 RETURNING project_id, project_name", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};
