/**
 * Role-Based Access Control middleware
 *
 * Usage:
 *   router.delete("/:id", rbac("Admin","Manager"), controller.delete)
 *   router.get("/",       rbac(),                  controller.getAll)   // any logged-in user
 */

const ROLE_RANK = { Admin: 4, Manager: 3, Sales: 2, Developer: 2, Marketing: 2, User: 1 };

function rbac(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // No roles specified → any authenticated user allowed
    if (!allowedRoles.length) return next();

    const userRole  = req.user.role || "User";
    const userRank  = ROLE_RANK[userRole] || 0;
    const minRank   = Math.min(...allowedRoles.map(r => ROLE_RANK[r] || 0));

    if (userRank >= minRank || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: `Access denied — requires one of: ${allowedRoles.join(", ")}`,
    });
  };
}

module.exports = rbac;
