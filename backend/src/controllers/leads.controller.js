const pool = require("../config/db");
const { validate, bad, LEAD_STATUSES } = require("../middleware/validate");

exports.createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source, service_interest, status = "New" } = req.body;
    const errs = validate(req.body, {
      name:    { required: true },
      email:   { required: true, isEmail: true },
      company: { required: true },
      status:  { enum: LEAD_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, company, source, service_interest, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), phone||null, company.trim(), source||null, service_interest||null, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getLeads = async (req, res, next) => {
  try {
    const { status, search, limit = 200, offset = 0 } = req.query;
    let q = "SELECT * FROM leads WHERE 1=1";
    const params = [];
    if (status && status !== "All") { params.push(status); q += ` AND status=$${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR company ILIKE $${params.length})`; }
    params.push(Number(limit)); q += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    params.push(Number(offset)); q += ` OFFSET $${params.length}`;
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM leads WHERE lead_id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Lead not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, source, service_interest, status } = req.body;
    const errs = validate(req.body, {
      name:    { required: true },
      email:   { required: true, isEmail: true },
      company: { required: true },
      status:  { enum: LEAD_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `UPDATE leads SET name=$1, email=$2, phone=$3, company=$4, source=$5,
       service_interest=$6, status=$7 WHERE lead_id=$8 RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), phone||null, company.trim(), source||null, service_interest||null, status||"New", id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Lead not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM leads WHERE lead_id=$1 RETURNING lead_id, name", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Lead not found" });
    res.json({ message: "Lead deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};

// ── Convert Lead → Client ────────────────────────────────────

exports.convertLead = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Fetch the lead
    const leadRes = await client.query("SELECT * FROM leads WHERE lead_id=$1", [id]);
    if (!leadRes.rows.length) return res.status(404).json({ error: "Lead not found" });
    const lead = leadRes.rows[0];

    if (lead.status === "Converted") {
      return res.status(400).json({ error: "Lead is already converted" });
    }

    // Begin transaction
    await client.query("BEGIN");

    // 1. Create client from lead data
    const clientRes = await client.query(
      `INSERT INTO clients (company_name, contact_person, email, phone, status)
       VALUES ($1, $2, $3, $4, 'Active') RETURNING *`,
      [lead.company, lead.name, lead.email, lead.phone]
    );
    const newClient = clientRes.rows[0];

    // 2. Mark lead as Converted
    await client.query(
      "UPDATE leads SET status='Converted', updated_at=CURRENT_TIMESTAMP WHERE lead_id=$1",
      [id]
    );

    // 3. Link any existing deals for this lead to the new client
    await client.query(
      "UPDATE deals SET client_id=$1 WHERE lead_id=$2 AND client_id IS NULL",
      [newClient.client_id, id]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Lead converted to client", client: newClient });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

// ── Lead Notes ───────────────────────────────────────────────

exports.getNotes = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lead_notes WHERE lead_id=$1 ORDER BY created_at DESC",
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
      "INSERT INTO lead_notes (lead_id, note, created_by) VALUES ($1,$2,$3) RETURNING *",
      [req.params.id, note.trim(), created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM lead_notes WHERE note_id=$1 AND lead_id=$2 RETURNING note_id",
      [req.params.note_id, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) { next(err); }
};
