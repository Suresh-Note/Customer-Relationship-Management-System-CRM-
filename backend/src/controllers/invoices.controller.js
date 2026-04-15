const pool = require("../config/db");
const { validate, bad, INVOICE_STATUSES } = require("../middleware/validate");

exports.createInvoice = async (req, res, next) => {
  try {
    const { project_id, amount, status = "Pending", issued_date, due_date } = req.body;
    const errs = validate(req.body, {
      amount: { required: true, positiveNum: true },
      status: { enum: INVOICE_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `INSERT INTO invoices (project_id, amount, status, issued_date, due_date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [project_id||null, Number(amount), status, issued_date||null, due_date||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { status, search, project_id, client_id } = req.query;
    let q = `SELECT i.*, p.project_name, c.company_name AS client_name, p.client_id
             FROM invoices i
             LEFT JOIN projects p ON p.project_id = i.project_id
             LEFT JOIN clients  c ON c.client_id  = p.client_id
             WHERE 1=1`;
    const params = [];
    if (status && status !== "All") { params.push(status);     q += ` AND i.status=$${params.length}`; }
    if (project_id)                 { params.push(project_id); q += ` AND i.project_id=$${params.length}`; }
    if (client_id)                  { params.push(client_id);  q += ` AND p.client_id=$${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND (p.project_name ILIKE $${params.length} OR CAST(i.invoice_id AS TEXT) LIKE $${params.length})`; }
    q += " ORDER BY i.invoice_id DESC";
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.project_name FROM invoices i
       LEFT JOIN projects p ON p.project_id = i.project_id WHERE i.invoice_id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Invoice not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { project_id, amount, status, issued_date, due_date } = req.body;
    const errs = validate(req.body, {
      amount: { required: true, positiveNum: true },
      status: { required: true, enum: INVOICE_STATUSES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `UPDATE invoices SET project_id=$1, amount=$2, status=$3, issued_date=$4, due_date=$5
       WHERE invoice_id=$6 RETURNING *`,
      [project_id||null, Number(amount), status, issued_date||null, due_date||null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Invoice not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM invoices WHERE invoice_id=$1 RETURNING invoice_id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Invoice not found" });
    res.json({ message: "Invoice deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};
