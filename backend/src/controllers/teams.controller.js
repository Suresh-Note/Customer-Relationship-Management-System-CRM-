const pool = require("../config/db");
const { validate, bad } = require("../middleware/validate");

exports.createTeam = async (req, res, next) => {
  try {
    const { team_name, description } = req.body;
    const errs = validate(req.body, { team_name: { required: true } });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      "INSERT INTO teams (team_name, description) VALUES ($1,$2) RETURNING *",
      [team_name.trim(), description||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getTeams = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, COUNT(u.user_id)::int AS member_count
       FROM teams t LEFT JOIN users u ON u.team_id = t.team_id
       GROUP BY t.team_id ORDER BY t.team_id`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getTeamById = async (req, res, next) => {
  try {
    const [teamRes, membersRes] = await Promise.all([
      pool.query("SELECT * FROM teams WHERE team_id=$1", [req.params.id]),
      pool.query("SELECT user_id, name, email, role FROM users WHERE team_id=$1", [req.params.id]),
    ]);
    if (!teamRes.rows.length) return res.status(404).json({ error: "Team not found" });
    res.json({ ...teamRes.rows[0], members: membersRes.rows });
  } catch (err) { next(err); }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { team_name, description } = req.body;
    const errs = validate(req.body, { team_name: { required: true } });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      "UPDATE teams SET team_name=$1, description=$2 WHERE team_id=$3 RETURNING *",
      [team_name.trim(), description||null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Team not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM teams WHERE team_id=$1 RETURNING team_id, team_name", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Team not found" });
    res.json({ message: "Team deleted", deleted: result.rows[0] });
  } catch (err) { next(err); }
};

// Add / remove member from team
exports.addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });
    const result = await pool.query(
      "UPDATE users SET team_id=$1 WHERE user_id=$2 RETURNING user_id, name, email, role, team_id",
      [id, user_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "UPDATE users SET team_id=NULL WHERE user_id=$1 RETURNING user_id, name",
      [user_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Member removed from team", user: result.rows[0] });
  } catch (err) { next(err); }
};
