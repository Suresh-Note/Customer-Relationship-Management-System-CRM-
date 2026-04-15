const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/leads.controller");

// Read — any authenticated user
router.get("/",    c.getLeads);
router.get("/:id", c.getLeadById);

// Create/Update — Sales, Developer, Marketing, Manager, Admin
router.post("/",   rbac("Sales", "Manager", "Admin"), c.createLead);
router.put("/:id", rbac("Sales", "Manager", "Admin"), c.updateLead);

// Convert lead → client — Manager, Admin only (business-critical)
router.post("/:id/convert", rbac("Manager", "Admin"), c.convertLead);

// Delete — Manager, Admin only
router.delete("/:id", rbac("Manager", "Admin"), c.deleteLead);

// Notes — any authenticated user can read; Sales+ can write
router.get("/:id/notes",             c.getNotes);
router.post("/:id/notes",            rbac("Sales", "Manager", "Admin"), c.addNote);
router.delete("/:id/notes/:note_id", rbac("Manager", "Admin"), c.deleteNote);

module.exports = router;
