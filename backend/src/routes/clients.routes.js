const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/clients.controller");

// Read — any authenticated user
router.get("/",    c.getClients);
router.get("/:id", c.getClientById);

// Create/Update — Sales, Manager, Admin
router.post("/",   rbac("Sales", "Manager", "Admin"), c.createClient);
router.put("/:id", rbac("Sales", "Manager", "Admin"), c.updateClient);

// Delete — Manager, Admin only
router.delete("/:id", rbac("Manager", "Admin"), c.deleteClient);

// Notes — any authenticated user can read; Sales+ can write
router.get("/:id/notes",             c.getNotes);
router.post("/:id/notes",            rbac("Sales", "Manager", "Admin"), c.addNote);
router.delete("/:id/notes/:note_id", rbac("Manager", "Admin"), c.deleteNote);

module.exports = router;
