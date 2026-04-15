const pool = require("../config/db");
const { validate, bad, ACTIVITY_TYPES } = require("../middleware/validate");

exports.createActivity = async (req, res, next) => {
  try {
    const { lead_id, type, notes } = req.body;
    const errs = validate(req.body, {
      type: { required: true, enum: ACTIVITY_TYPES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `INSERT INTO activities (lead_id, type, notes) VALUES ($1,$2,$3) RETURNING *`,
      [lead_id||null, type, notes||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getActivities = async (req, res, next) => {
  try {
    const { type, lead_id, search } = req.query;
    let q = `SELECT a.*, l.name AS lead_name FROM activities a
             LEFT JOIN leads l ON l.lead_id = a.lead_id WHERE 1=1`;
    const params = [];
    if (type && type !== "All")  { params.push(type);    q += ` AND a.type=$${params.length}`; }
    if (lead_id) { params.push(lead_id); q += ` AND a.lead_id=$${params.length}`; }
    if (search)  { params.push(`%${search}%`); q += ` AND a.notes ILIKE $${params.length}`; }
    q += " ORDER BY a.activity_date DESC";
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getActivityById = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM activities WHERE activity_id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Activity not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lead_id, type, notes } = req.body;
    const errs = validate(req.body, {
      type: { required: true, enum: ACTIVITY_TYPES },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `UPDATE activities SET lead_id=$1, type=$2, notes=$3 WHERE activity_id=$4 RETURNING *`,
      [lead_id||null, type, notes||null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Activity not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteActivity = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM activities WHERE activity_id=$1 RETURNING activity_id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Activity not found" });
    res.json({ message: "Activity deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};
