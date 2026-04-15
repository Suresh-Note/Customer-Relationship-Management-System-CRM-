const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/activities.controller");

// Read — any authenticated user
router.get("/",    c.getActivities);
router.get("/:id", c.getActivityById);

// Create/Update — any team member (Sales, Developer, Marketing, Manager, Admin)
router.post("/",   rbac("Sales", "Developer", "Marketing", "Manager", "Admin"), c.createActivity);
router.put("/:id", rbac("Sales", "Developer", "Marketing", "Manager", "Admin"), c.updateActivity);

// Delete — Manager, Admin only
router.delete("/:id", rbac("Manager", "Admin"), c.deleteActivity);

module.exports = router;
