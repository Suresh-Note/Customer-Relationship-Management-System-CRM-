const router = require("express").Router();
const auth   = require("../middleware/auth");
const c      = require("../controllers/auth.controller");
const pool   = require("../config/db");

router.post("/login",    c.login);
router.post("/register", c.register);
router.post("/refresh",  c.refresh);
router.post("/logout",   c.logout);

router.get("/me", auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT user_id, name, email, role, team_id FROM users WHERE user_id=$1",
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
