import { useAuth } from "../context/AuthContext";
import { hasRole } from "../utils/rbac";

export default function Can({ roles, children, fallback = null }) {
  const { user } = useAuth();
  
  if (hasRole(user?.role, ...roles)) {
    return children;
  }
  
  return fallback;
}
