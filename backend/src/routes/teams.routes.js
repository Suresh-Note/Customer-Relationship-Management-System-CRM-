const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/teams.controller");

// Read — any authenticated user
router.get("/",    c.getTeams);
router.get("/:id", c.getTeamById);

// Create/Update/Delete teams — Manager, Admin only (organizational structure)
router.post("/",      rbac("Manager", "Admin"), c.createTeam);
router.put("/:id",    rbac("Manager", "Admin"), c.updateTeam);
router.delete("/:id", rbac("Admin"), c.deleteTeam);

// Team membership — Manager, Admin only
router.post("/:id/members",             rbac("Manager", "Admin"), c.addMember);
router.delete("/:id/members/:user_id",  rbac("Manager", "Admin"), c.removeMember);

module.exports = router;
