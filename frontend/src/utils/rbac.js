export const ROLE_RANK = { Admin: 4, Manager: 3, Sales: 2, Developer: 2, Marketing: 2, User: 1 };

export function hasRole(userRole, ...allowedRoles) {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  
  const userRank = ROLE_RANK[userRole] || 0;
  const minRank = Math.min(...allowedRoles.map(r => ROLE_RANK[r] || 0));
  
  return userRank >= minRank || allowedRoles.includes(userRole);
}
