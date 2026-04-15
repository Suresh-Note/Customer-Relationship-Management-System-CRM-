const pool = require("../config/db");
const { validate, bad } = require("../middleware/validate");
const { hashPassword, verifyPassword } = require("../utils/password");

exports.getUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT user_id, name, email, role, team_id, contact_number, gender, created_at FROM users ORDER BY user_id"
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.role, u.team_id, t.team_name
       FROM users u LEFT JOIN teams t ON t.team_id = u.team_id
       WHERE u.user_id=$1`, [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// Get current logged-in user profile
exports.getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.role, u.team_id, t.team_name
       FROM users u LEFT JOIN teams t ON t.team_id = u.team_id
       WHERE u.user_id=$1`, [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// Update own profile
exports.updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const errs = validate(req.body, {
      name:  { required: true },
      email: { required: true, isEmail: true },
    });
    if (errs.length) return bad(res, errs);

    const result = await pool.query(
      `UPDATE users SET name=$1, email=$2 WHERE user_id=$3
       RETURNING user_id, name, email, role, team_id`,
      [name.trim(), email.trim().toLowerCase(), req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// Change own password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const userRes = await pool.query("SELECT password FROM users WHERE user_id=$1", [req.user.userId]);
    if (!userRes.rows.length) return res.status(404).json({ error: "User not found" });

    if (!verifyPassword(currentPassword, userRes.rows[0].password)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await pool.query("UPDATE users SET password=$1 WHERE user_id=$2", [hashPassword(newPassword), req.user.userId]);
    res.json({ message: "Password changed successfully" });
  } catch (err) { next(err); }
};

// Admin: update any user's role/team
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, team_id } = req.body;
    const result = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email),
       role=COALESCE($3,role), team_id=$4 WHERE user_id=$5
       RETURNING user_id, name, email, role, team_id`,
      [name||null, email||null, role||null, team_id||null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
