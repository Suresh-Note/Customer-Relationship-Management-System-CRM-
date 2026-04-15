const pool = require("../config/db");
const { validate, bad, CLIENT_STATUSES } = require("../middleware/validate");

exports.createClient = async (req, res, next) => {
  try {
    const { company_name, contact_person, email, phone, status = "Active" } = req.body;
    const errs = validate(req.body, {
      company_name: { required: true },
      email:        { isEmail: true },
      status:       { enum: CLIENT_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `INSERT INTO clients (company_name, contact_person, email, phone, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [company_name.trim(), contact_person||null, email ? email.trim().toLowerCase() : null, phone||null, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getClients = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const conditions = ["1=1"];
    const params = [];
    if (status && status !== "All") { params.push(status); conditions.push(`c.status=$${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(c.company_name ILIKE $${params.length} OR c.contact_person ILIKE $${params.length})`); }

    const q = `
      SELECT c.*,
        p.project_name,
        p.status  AS project_status,
        COALESCE(d.total_amount, 0) AS total_amount
      FROM clients c
      LEFT JOIN LATERAL (
        SELECT project_name, status
        FROM projects
        WHERE client_id = c.client_id
        ORDER BY project_id DESC
        LIMIT 1
      ) p ON true
      LEFT JOIN (
        SELECT client_id, SUM(value) AS total_amount
        FROM deals
        GROUP BY client_id
      ) d ON d.client_id = c.client_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY c.client_id DESC
    `;
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientRes = await pool.query("SELECT * FROM clients WHERE client_id=$1", [id]);
    if (!clientRes.rows.length) return res.status(404).json({ error: "Client not found" });
    const client = clientRes.rows[0];

    const [projects, deals, invoices] = await Promise.all([
      pool.query("SELECT project_id, project_name, status, start_date, end_date FROM projects WHERE client_id=$1 ORDER BY project_id DESC", [id]),
      pool.query("SELECT deal_id, deal_name, value, stage, expected_close FROM deals WHERE client_id=$1 ORDER BY deal_id DESC", [id]),
      pool.query(
        `SELECT i.invoice_id, i.amount, i.status, i.issued_date, i.due_date, p.project_name
           FROM invoices i
           JOIN projects p ON p.project_id = i.project_id
          WHERE p.client_id=$1 ORDER BY i.invoice_id DESC`,
        [id]
      ),
    ]);

    client.projects = projects.rows;
    client.deals    = deals.rows;
    client.invoices = invoices.rows;
    res.json(client);
  } catch (err) { next(err); }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company_name, contact_person, email, phone, status = "Active" } = req.body;
    const errs = validate(req.body, {
      company_name: { required: true },
      email:        { isEmail: true },
      status:       { enum: CLIENT_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `UPDATE clients SET company_name=$1, contact_person=$2, email=$3, phone=$4, status=$5
       WHERE client_id=$6 RETURNING *`,
      [company_name.trim(), contact_person||null, email ? email.trim().toLowerCase() : null, phone||null, status, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Client not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM clients WHERE client_id=$1 RETURNING client_id, company_name", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};

// ── Client Notes ─────────────────────────────────────────────

exports.getNotes = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM client_notes WHERE client_id=$1 ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.addNote = async (req, res, next) => {
  try {
    const { note, created_by = "You" } = req.body;
    if (!note || !note.trim()) return res.status(400).json({ error: "Note cannot be empty" });
    const result = await pool.query(
      "INSERT INTO client_notes (client_id, note, created_by) VALUES ($1,$2,$3) RETURNING *",
      [req.params.id, note.trim(), created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM client_notes WHERE note_id=$1 AND client_id=$2 RETURNING note_id",
      [req.params.note_id, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) { next(err); }
};
