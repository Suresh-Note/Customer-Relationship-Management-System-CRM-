const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/projects.controller");

// Read — any authenticated user
router.get("/",    c.getProjects);
router.get("/:id", c.getProjectById);

// Create/Update — Developer, Manager, Admin
router.post("/",   rbac("Developer", "Manager", "Admin"), c.createProject);
router.put("/:id", rbac("Developer", "Manager", "Admin"), c.updateProject);

// Delete — Manager, Admin only
router.delete("/:id", rbac("Manager", "Admin"), c.deleteProject);

module.exports = router;
