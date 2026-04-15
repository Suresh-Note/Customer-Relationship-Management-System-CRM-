const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/deals.controller");

// Read — any authenticated user
router.get("/",    c.getDeals);
router.get("/:id", c.getDealById);

// Create/Update — Sales, Manager, Admin
router.post("/",   rbac("Sales", "Manager", "Admin"), c.createDeal);
router.put("/:id", rbac("Sales", "Manager", "Admin"), c.updateDeal);

// Delete — Manager, Admin only
router.delete("/:id", rbac("Manager", "Admin"), c.deleteDeal);

module.exports = router;
