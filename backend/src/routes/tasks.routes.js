const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/tasks.controller");

// Read — any authenticated user
router.get("/",    c.getTasks);
router.get("/:id", c.getTaskById);

// Create/Update — any team member (Sales, Developer, Marketing, Manager, Admin)
router.post("/",   rbac("Sales", "Developer", "Marketing", "Manager", "Admin"), c.createTask);
router.put("/:id", rbac("Sales", "Developer", "Marketing", "Manager", "Admin"), c.updateTask);

// Delete — Manager, Admin only
router.delete("/:id", rbac("Manager", "Admin"), c.deleteTask);

module.exports = router;
