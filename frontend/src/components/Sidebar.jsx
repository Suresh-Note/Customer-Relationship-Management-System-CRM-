import React from "react";
import { Link, useLocation } from "react-router-dom";
 
const navItems = [
  { path: "/", label: "Dashboard", icon: "⊞" },
  { path: "/leads", label: "Leads", icon: "◈" },
  { path: "/deals", label: "Deals", icon: "◇" },
  { path: "/clients", label: "Clients", icon: "◉" },
  { path: "/projects", label: "Projects", icon: "▣" },
  { path: "/tasks", label: "Tasks", icon: "☑" },
  { path: "/teams", label: "Teams", icon: "⬡" },
  { path: "/invoices", label: "Invoices", icon: "▤" },
  { path: "/activities", label: "Activities", icon: "◎" },
];
 
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');
 
  .crm-sidebar {
    width: var(--crm-sidebar-width, 240px);
    min-height: 100vh;
    background: #0a0f1a;
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    font-family: 'Syne', sans-serif;
  }
 
  .crm-sidebar-logo {
    padding: 28px 24px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
 
  .crm-logo-mark {
    display: flex;
    align-items: center;
    gap: 10px;
  }
 
  .crm-logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #00d4aa, #0099ff);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 800;
    color: #0a0f1a;
    letter-spacing: -1px;
  }
 
  .crm-logo-text {
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 1px;
  }
 
  .crm-logo-sub {
    font-size: 10px;
    color: #00d4aa;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 1px;
    font-family: 'DM Mono', monospace;
  }
 
  .crm-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }
 
  .crm-nav-section-label {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    padding: 16px 12px 8px;
    font-family: 'DM Mono', monospace;
  }
 
  .crm-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    text-decoration: none;
    color: rgba(255,255,255,0.5);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.3px;
    transition: all 0.18s ease;
    position: relative;
    overflow: hidden;
  }
 
  .crm-nav-link:hover {
    color: #ffffff;
    background: rgba(255,255,255,0.05);
  }
 
  .crm-nav-link.active {
    color: #ffffff;
    background: rgba(0, 212, 170, 0.12);
  }
 
  .crm-nav-link.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    background: #00d4aa;
    border-radius: 0 3px 3px 0;
  }
 
  .crm-nav-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    opacity: 0.7;
    flex-shrink: 0;
  }
 
  .crm-nav-link.active .crm-nav-icon {
    opacity: 1;
    color: #00d4aa;
  }
 
  .crm-sidebar-footer {
    padding: 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
 
  .crm-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: background 0.2s;
  }
 
  .crm-user-card:hover { background: rgba(255,255,255,0.06); }
 
  .crm-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00d4aa, #0099ff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #0a0f1a;
    flex-shrink: 0;
  }
 
  .crm-user-info { flex: 1; min-width: 0; }
  .crm-user-name { font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .crm-user-role { font-size: 10px; color: rgba(255,255,255,0.3); font-family: 'DM Mono', monospace; }

  @media (max-width: 960px) {
    .crm-sidebar {
      position: relative;
      top: auto;
      left: auto;
      bottom: auto;
      width: 100%;
      min-height: auto;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .crm-nav {
      overflow-y: visible;
    }
  }
`;
 
function Sidebar() {
  const location = useLocation();
 
  return (
    <>
      <style>{styles}</style>
      <div className="crm-sidebar">
        <div className="crm-sidebar-logo">
          <div className="crm-logo-mark">
            <div className="crm-logo-icon">Aw</div>
            <div>
              <div className="crm-logo-text">Astrawin</div>
              <div className="crm-logo-sub">CRM Suite</div>
            </div>
          </div>
        </div>
 
        <nav className="crm-nav">
          <div className="crm-nav-section-label">Main</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`crm-nav-link${location.pathname === item.path ? " active" : ""}`}
            >
              <span className="crm-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
 
        <div className="crm-sidebar-footer">
          <div className="crm-user-card">
            <div className="crm-avatar">A</div>
            <div className="crm-user-info">
              <div className="crm-user-name">Admin User</div>
              <div className="crm-user-role">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
 
export default Sidebar;
