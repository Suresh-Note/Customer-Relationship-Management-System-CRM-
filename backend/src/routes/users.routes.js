const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/users.controller");

// Read — any authenticated user
router.get("/",    c.getUsers);
router.get("/me",  c.getMe);
router.get("/:id", c.getUserById);

// Self-management — any authenticated user can update their own profile/password
router.put("/me",          c.updateMe);
router.put("/me/password", c.changePassword);

// Admin: update any user's role/team — Admin only (security-critical)
router.put("/:id", rbac("Admin"), c.updateUser);

module.exports = router;
