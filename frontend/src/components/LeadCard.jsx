import React from "react";
 
const statusColors = {
  New: { bg: "rgba(0,212,170,0.1)", color: "#00d4aa", dot: "#00d4aa" },
  Contacted: { bg: "rgba(0,153,255,0.1)", color: "#0099ff", dot: "#0099ff" },
  Qualified: { bg: "rgba(180,120,255,0.1)", color: "#b478ff", dot: "#b478ff" },
  Proposal: { bg: "rgba(255,180,0,0.1)", color: "#ffb400", dot: "#ffb400" },
  Closed: { bg: "rgba(80,200,120,0.1)", color: "#50c878", dot: "#50c878" },
  Lost: { bg: "rgba(255,80,80,0.1)", color: "#ff5050", dot: "#ff5050" },
};
 
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
 
  .lead-card {
    background: #111827;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 18px 20px;
    transition: all 0.22s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    font-family: 'Syne', sans-serif;
  }
 
  .lead-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00d4aa, #0099ff);
    opacity: 0;
    transition: opacity 0.22s;
  }
 
  .lead-card:hover {
    border-color: rgba(0,212,170,0.25);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
 
  .lead-card:hover::before { opacity: 1; }
 
  .lead-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }
 
  .lead-card-avatar {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00d4aa22, #0099ff22);
    border: 1px solid rgba(0,212,170,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 800;
    color: #00d4aa;
  }
 
  .lead-card-status {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    font-family: 'DM Mono', monospace;
  }
 
  .lead-card-status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
 
  .lead-card-name {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 3px;
  }
 
  .lead-card-company {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    margin-bottom: 12px;
  }
 
  .lead-card-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
 
  .lead-card-meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-family: 'DM Mono', monospace;
  }
 
  .lead-card-meta-icon {
    width: 16px;
    font-size: 11px;
    opacity: 0.6;
    flex-shrink: 0;
  }
 
  .lead-card-footer {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
 
  .lead-card-service {
    display: inline-block;
    padding: 3px 10px;
    background: rgba(0,153,255,0.1);
    border: 1px solid rgba(0,153,255,0.2);
    color: #0099ff;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-family: 'DM Mono', monospace;
  }
 
  .lead-card-source {
    font-size: 11px;
    color: rgba(255,255,255,0.2);
    font-family: 'DM Mono', monospace;
  }
`;
 
function LeadCard({ lead }) {
  const status = lead.status || "New";
  const statusStyle = statusColors[status] || statusColors["New"];
  const initials = (lead.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
 
  return (
    <>
      <style>{styles}</style>
      <div className="lead-card">
        <div className="lead-card-header">
          <div className="lead-card-avatar">{initials}</div>
          <div
            className="lead-card-status"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            <div className="lead-card-status-dot" style={{ background: statusStyle.dot }} />
            {status}
          </div>
        </div>
 
        <div className="lead-card-name">{lead.name}</div>
        <div className="lead-card-company">{lead.company || "—"}</div>
 
        <div className="lead-card-meta">
          {lead.email && (
            <div className="lead-card-meta-row">
              <span className="lead-card-meta-icon">✉</span>
              {lead.email}
            </div>
          )}
          {lead.phone && (
            <div className="lead-card-meta-row">
              <span className="lead-card-meta-icon">☏</span>
              {lead.phone}
            </div>
          )}
        </div>
 
        <div className="lead-card-footer">
          {lead.service_interest && (
            <span className="lead-card-service">{lead.service_interest}</span>
          )}
          {lead.source && (
            <span className="lead-card-source">via {lead.source}</span>
          )}
        </div>
      </div>
    </>
  );
}
 
export default LeadCard;