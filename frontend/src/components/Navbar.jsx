import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
 
const pageTitles = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/deals": "Deals",
  "/clients": "Clients",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/teams": "Teams",
  "/invoices": "Invoices",
  "/activities": "Activities",
};
 
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
 
  .crm-navbar {
    height: 64px;
    background: #0d1424;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    padding: 0 28px;
    gap: 20px;
    position: sticky;
    top: 0;
    z-index: 50;
    font-family: 'Syne', sans-serif;
  }
 
  .crm-navbar-title {
    flex: 1;
  }
 
  .crm-page-title {
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.3px;
  }
 
  .crm-breadcrumb {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    font-family: 'DM Mono', monospace;
    letter-spacing: 1px;
    margin-top: 1px;
  }
 
  .crm-navbar-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 8px 14px;
    width: 240px;
    transition: all 0.2s;
  }
 
  .crm-navbar-search:focus-within {
    border-color: #00d4aa;
    background: rgba(0,212,170,0.05);
  }
 
  .crm-search-icon {
    color: rgba(255,255,255,0.3);
    font-size: 13px;
  }
 
  .crm-search-input {
    background: none;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 13px;
    font-family: 'Syne', sans-serif;
    width: 100%;
  }
 
  .crm-search-input::placeholder { color: rgba(255,255,255,0.25); }
 
  .crm-navbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
 
  .crm-icon-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(255,255,255,0.5);
    font-size: 16px;
    position: relative;
  }
 
  .crm-icon-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
 
  .crm-notif-badge {
    position: absolute;
    top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #00d4aa;
    border-radius: 50%;
    border: 1.5px solid #0d1424;
  }
 
  .crm-divider {
    width: 1px;
    height: 24px;
    background: rgba(255,255,255,0.08);
  }
 
  .crm-navbar-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #00d4aa, #0099ff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #0a0f1a;
    cursor: pointer;
    transition: transform 0.2s;
  }
 
  .crm-navbar-avatar:hover { transform: scale(1.05); }
 
  .crm-logout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,80,80,0.08);
    border: 1px solid rgba(255,80,80,0.2);
    color: #ff6b6b;
    border-radius: 8px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.2s;
  }
 
  .crm-logout-btn:hover {
    background: rgba(255,80,80,0.15);
    border-color: rgba(255,80,80,0.4);
  }

  @media (max-width: 960px) {
    .crm-navbar {
      height: auto;
      padding: 16px;
      flex-wrap: wrap;
    }

    .crm-navbar-title {
      min-width: 0;
    }

    .crm-navbar-search {
      width: 100%;
      order: 3;
    }

    .crm-navbar-actions {
      width: 100%;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
  }
`;
 
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
 
  const pageTitle = pageTitles[location.pathname] || "Page";
 
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
 
  return (
    <>
      <style>{styles}</style>
      <div className="crm-navbar">
        <div className="crm-navbar-title">
          <div className="crm-page-title">{pageTitle}</div>
          <div className="crm-breadcrumb">Astrawin / {pageTitle}</div>
        </div>
 
        <div className="crm-navbar-search">
          <span className="crm-search-icon">⌕</span>
          <input
            className="crm-search-input"
            placeholder="Search anything..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
 
        <div className="crm-navbar-actions">
          <div className="crm-icon-btn">
            🔔
            <span className="crm-notif-badge" />
          </div>
          <div className="crm-icon-btn">⚙</div>
          <div className="crm-divider" />
          <div className="crm-navbar-avatar">A</div>
          <button className="crm-logout-btn" onClick={handleLogout}>
            ⏻ Logout
          </button>
        </div>
      </div>
    </>
  );
}
 
export default Navbar;
 
