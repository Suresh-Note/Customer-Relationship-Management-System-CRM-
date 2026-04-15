const router = require("express").Router();
const rbac   = require("../middleware/rbac");
const c      = require("../controllers/invoices.controller");

// Read — any authenticated user
router.get("/",    c.getInvoices);
router.get("/:id", c.getInvoiceById);

// Create/Update — Manager, Admin only (financial operations)
router.post("/",   rbac("Manager", "Admin"), c.createInvoice);
router.put("/:id", rbac("Manager", "Admin"), c.updateInvoice);

// Delete — Admin only (financial records should rarely be deleted)
router.delete("/:id", rbac("Admin"), c.deleteInvoice);

module.exports = router;
