const pool = require("../config/db");
const { validate, bad, DEAL_STAGES, PRIORITY } = require("../middleware/validate");

exports.createDeal = async (req, res, next) => {
  try {
    const { deal_name, value, stage = "Prospecting", lead_id, client_id, probability, expected_close } = req.body;
    const errs = validate(req.body, {
      deal_name: { required: true },
      value:     { required: true, positiveNum: true },
      stage:     { enum: DEAL_STAGES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `INSERT INTO deals (deal_name, value, stage, lead_id, client_id, probability, expected_close)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [deal_name.trim(), Number(value), stage, lead_id||null, client_id||null,
       probability !== "" && probability != null ? Number(probability) : null,
       expected_close||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getDeals = async (req, res, next) => {
  try {
    const { stage, search, client_id, lead_id } = req.query;
    let q = `SELECT d.*, c.company_name AS client_name, l.name AS lead_name
             FROM deals d
             LEFT JOIN clients c ON c.client_id = d.client_id
             LEFT JOIN leads   l ON l.lead_id   = d.lead_id
             WHERE 1=1`;
    const params = [];
    if (stage)     { params.push(stage);     q += ` AND d.stage=$${params.length}`; }
    if (client_id) { params.push(client_id); q += ` AND d.client_id=$${params.length}`; }
    if (lead_id)   { params.push(lead_id);   q += ` AND d.lead_id=$${params.length}`; }
    if (search)    { params.push(`%${search}%`); q += ` AND d.deal_name ILIKE $${params.length}`; }
    q += " ORDER BY d.deal_id DESC";
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getDealById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.*, c.company_name AS client_name, l.name AS lead_name
         FROM deals d
         LEFT JOIN clients c ON c.client_id = d.client_id
         LEFT JOIN leads   l ON l.lead_id   = d.lead_id
        WHERE d.deal_id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Deal not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.updateDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deal_name, value, stage, lead_id, client_id, probability, expected_close } = req.body;
    const errs = validate(req.body, {
      deal_name: { required: true },
      value:     { required: true, positiveNum: true },
      stage:     { required: true, enum: DEAL_STAGES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `UPDATE deals SET deal_name=$1, value=$2, stage=$3, lead_id=$4, client_id=$5,
       probability=$6, expected_close=$7 WHERE deal_id=$8 RETURNING *`,
      [deal_name.trim(), Number(value), stage, lead_id||null, client_id||null,
       probability !== "" && probability != null ? Number(probability) : null,
       expected_close||null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Deal not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteDeal = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM deals WHERE deal_id=$1 RETURNING deal_id, deal_name", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Deal not found" });
    res.json({ message: "Deal deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};
