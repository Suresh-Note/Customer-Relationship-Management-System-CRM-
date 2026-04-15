import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const mainItems = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/clients", label: "Contacts", icon: "contacts" },
  { to: "/deals", label: "Deals", icon: "deals" },
  { to: "/leads", label: "Pipeline", icon: "pipeline" },
];

const toolItems = [
  { to: "/projects", label: "Reports", icon: "reports" },
  { to: "/tasks", label: "Automations", icon: "automations" },
  { to: "/activities", label: "Activities", icon: "activities" },
  { to: "/team", label: "Settings", icon: "settings" },
];

function SidebarLinks({ items }) {
  return (
    <nav className="crm-sidebar-menu">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `crm-sidebar-menu__item${isActive ? " is-active" : ""}`
          }
        >
          <span
            className={`crm-sidebar-menu__icon crm-sidebar-menu__icon--${item.icon}`}
            aria-hidden="true"
          />
          <span className="crm-sidebar-menu__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function AppSidebar() {
  const { logout } = useAuth();
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
    <aside className="crm-sidebar-layout__nav">
      <div className="crm-sidebar-layout__brand">
        <div className="crm-sidebar-layout__brand-main">
          <span className="crm-sidebar-layout__brand-dot" aria-hidden="true" />
          <strong>AstrawinCRM</strong>
        </div>
      </div>

      <div className="crm-sidebar-layout__group">
        <div className="crm-sidebar-layout__group-label">Main</div>
        <SidebarLinks items={mainItems} />
      </div>

      <div className="crm-sidebar-layout__group crm-sidebar-layout__group--secondary">
        <div className="crm-sidebar-layout__group-label">Tools</div>
        <SidebarLinks items={toolItems} />
      </div>

      <button
        type="button"
        className="crm-sidebar-layout__logout"
        onClick={handleLogout}
        disabled={isSigningOut}
      >
        {isSigningOut ? "Signing out..." : "Logout"}
      </button>
    </aside>
  );
}

export default AppSidebar;
