import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasRole } from "../../utils/rbac";

const mainNav = [
  { to: "/", label: "Dashboard", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { to: "/leads", label: "Leads", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { to: "/clients", label: "Clients", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { to: "/deals", label: "Deals", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
];

const manageNav = [
  { to: "/projects", label: "Projects", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
  { to: "/tasks", label: "Tasks", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  { to: "/activities", label: "Activities", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  { to: "/invoices", label: "Invoices", roles: ["Manager", "Admin"], icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { to: "/team", label: "Team", roles: ["Manager", "Admin"], icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
];

function NavSection({ title, items, collapsed, userRole }) {
  // Filter items based on RBAC roles
  const filteredItems = items.filter(item => {
    if (!item.roles) return true;
    return hasRole(userRole, ...item.roles);
  });

  if (filteredItems.length === 0) return null;

  return (
    <div className="mb-2">
      {!collapsed && (
        <div className="px-4 pt-4 pb-1 text-[0.65rem] font-bold uppercase tracking-widest text-crm-copy-soft">
          {title}
        </div>
      )}
      <nav className="flex flex-col gap-0.5 px-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-crm-border shadow-sidebar flex flex-col transition-all duration-300 ease-in-out z-40 ${
        collapsed ? "w-[72px]" : "w-[230px]"
      }`}
    >
      {/* Brand row — toggle button moved here, right side of company name */}
      <div
        className={`flex items-center justify-between px-4 pt-5 pb-2 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-crm-primary flex-shrink-0" />
          {!collapsed && (
            <span className="text-base font-extrabold text-crm-heading tracking-tight">
              Astrawin CRM
            </span>
          )}
        </div>

        {/* Toggle button — now top-right next to brand name */}
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-crm-border text-crm-copy-soft hover:bg-crm-primary-light hover:text-crm-primary hover:border-crm-primary transition-colors flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>


      {/* Nav */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <NavSection title="Main" items={mainNav} collapsed={collapsed} userRole={user?.role} />
        <NavSection title="Manage" items={manageNav} collapsed={collapsed} userRole={user?.role} />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={isSigningOut}
        className={`flex items-center gap-2 mx-2 mb-4 p-2.5 rounded-xl text-sm font-semibold text-crm-copy-soft hover:bg-red-50 hover:text-crm-danger transition-colors ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {!collapsed && <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>}
      </button>
    </aside>
  );
}
