/**
 * DashboardArtifact.jsx — self-contained dashboard with sidebar + profile dropdown
 */
import React, { useEffect, useRef, useState } from "react";

// ─── Static data ───────────────────────────────────────────────────────────────
const KPI = [
  { label: "Pipeline Value", value: "₹1.1Cr", sub: "15 open deals",   subColor: "text-blue-600",  icon: "💼" },
  { label: "Won This Month",  value: "₹20.8L", sub: "3 deals closed",  subColor: "text-green-500", icon: "🏆" },
  { label: "Win Rate",        value: "17%",     sub: "Closed vs total", subColor: "text-red-400",   icon: "📊" },
  { label: "Active Clients",  value: "10",      sub: "6 hot leads",     subColor: "text-amber-500", icon: "🤝" },
];
const STAGES = [
  { label: "Prospecting", count: 3, value: "₹14.5L", pct: 35, bar: "bg-blue-400",   text: "text-blue-600"   },
  { label: "Qualified",   count: 4, value: "₹25.0L", pct: 60, bar: "bg-teal-400",   text: "text-teal-600"   },
  { label: "Proposal",    count: 4, value: "₹22.7L", pct: 55, bar: "bg-violet-400", text: "text-violet-600" },
  { label: "Negotiation", count: 4, value: "₹29.5L", pct: 72, bar: "bg-amber-400",  text: "text-amber-600"  },
  { label: "Closed Won",  count: 3, value: "₹20.8L", pct: 50, bar: "bg-green-500",  text: "text-green-600"  },
];
const FUNNEL     = [{ label:"Leads",value:20,bg:"bg-blue-50",   text:"text-blue-700"   },{ label:"Hot",value:6,bg:"bg-red-50",    text:"text-red-700"    },{ label:"Deals",value:18,bg:"bg-violet-50",text:"text-violet-700" },{ label:"Won",value:3,bg:"bg-green-50",  text:"text-green-700"  }];
const ACTIVITIES = [
  { icon:"📞",bg:"bg-blue-100 text-blue-600",    note:"Introductory call with Arjun Rao — discussed CRM pain points",           time:"15h ago"    },
  { icon:"📧",bg:"bg-amber-100 text-amber-700",  note:"Sent v2 Analytics Platform proposal to Priya Kumar with revised pricing", time:"17h ago"    },
  { icon:"🤝",bg:"bg-green-100 text-green-700",  note:"Sprint demo with Wipro Cloud team — presented Cloud Migration",          time:"19h ago"    },
  { icon:"📝",bg:"bg-violet-100 text-violet-600",note:"CRM Integration Pack moved to Negotiation. Client comparison",           time:"21h ago"    },
  { icon:"📞",bg:"bg-blue-100 text-blue-600",    note:"Discussed Retail Analytics Suite requirements with Kavita S.",           time:"Yesterday"  },
];
const TASKS    = [{ label:"Pending",value:10,color:"bg-slate-100 text-slate-600" },{ label:"In Progress",value:6,color:"bg-blue-100 text-blue-700" },{ label:"Completed",value:4,color:"bg-green-100 text-green-700" }];
const INVOICES = [{ label:"Paid",value:"₹31.3L",color:"text-green-600" },{ label:"Pending",value:"₹19.7L",color:"text-amber-600" },{ label:"Overdue",value:"₹10.5L",color:"text-red-600" }];
const PROJECTS = [{ label:"Active",value:5,color:"text-green-600" },{ label:"Planning",value:2,color:"text-blue-600" },{ label:"On Hold",value:1,color:"text-amber-600" },{ label:"Completed",value:2,color:"text-slate-500" }];

const DEFAULT_PROFILE = { name:"Suresh Kumar", role:"Account Manager", email:"suresh@astrawincrm.in", phone:"+91 98400 12345", location:"Chennai, Tamil Nadu" };

function getInitials(name="") { return name.split(" ").filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join(""); }

// ─── Nav icons ─────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { label:"Dashboard", icon:<path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/> },
  { label:"Leads",     icon:<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/> },
  { label:"Clients",   icon:<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/> },
  { label:"Deals",     icon:<path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/> },
];
const NAV_MANAGE = [
  { label:"Projects",   icon:<path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/> },
  { label:"Tasks",      icon:<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/> },
  { label:"Activities", icon:<path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/> },
  { label:"Invoices",   icon:<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/> },
  { label:"Team",       icon:<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/> },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, onToggle, collapsed }) {
  function NavItem({ item }) {
    const isActive = active === item.label;
    return (
      <button
        onClick={() => onNav(item.label)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${collapsed ? "justify-center px-0" : ""} ${
          isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        }`}
      >
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          {item.icon}
        </svg>
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  }

  return (
    <aside className={`flex-shrink-0 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ${collapsed ? "w-[60px]" : "w-[230px]"}`}>
      {/* Brand */}
      <div className={`flex items-center gap-2.5 px-4 pt-5 pb-3 ${collapsed ? "justify-center px-2" : ""}`}>
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {!collapsed && <span className="text-base font-extrabold text-slate-800 tracking-tight">Astrawin CRM</span>}
      </div>

      {/* Nav */}
      <div className={`flex-1 overflow-y-auto space-y-4 mt-2 ${collapsed ? "px-1" : "px-3"}`}>
        <div>
          {!collapsed && <div className="px-2 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Main</div>}
          <div className="space-y-0.5">{NAV_MAIN.map(i => <NavItem key={i.label} item={i} />)}</div>
        </div>
        <div>
          {!collapsed && <div className="px-2 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Manage</div>}
          <div className="space-y-0.5">{NAV_MANAGE.map(i => <NavItem key={i.label} item={i} />)}</div>
        </div>
      </div>

      {/* Sign out */}
      <button className={`flex items-center gap-2 mx-2 mb-4 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors ${collapsed ? "justify-center px-0" : ""}`}>
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {!collapsed && <span>Sign out</span>}
      </button>
    </aside>
  );
}

// ─── Profile dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    try { const r = sessionStorage.getItem("crm_pf"); return r ? JSON.parse(r) : DEFAULT_PROFILE; } catch { return DEFAULT_PROFILE; }
  });
  const [draft, setDraft] = useState(profile);

  function save() {
    setProfile(draft);
    try { sessionStorage.setItem("crm_pf", JSON.stringify(draft)); } catch {}
    setEditing(false);
  }

  const initials = getInitials(profile.name);

  if (editing) return (
    <div className="w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-5">
      <p className="text-sm font-bold text-slate-800 mb-4">Edit Profile</p>
      <div className="space-y-3">
        {[["Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Location","location","text"]].map(([lbl,key,type]) => (
          <div key={key}>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">{lbl}</label>
            <input type={type} value={draft[key]} onChange={e => setDraft(d=>({...d,[key]:e.target.value}))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-500 bg-slate-50" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={save}                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Save</button>
        <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-amber-200 flex items-center justify-center text-sm font-bold text-amber-800">{initials}</div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">{profile.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{profile.role}</p>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-4 space-y-2.5">
        {[
          { d:<path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>, v:profile.email },
          { d:<path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>, v:profile.phone },
          { d:<><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></>, v:profile.location },
        ].map(({d,v},i) => (
          <div key={i} className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">{d}</svg>
            <span className="text-xs text-slate-600 truncate">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => setEditing(true)} className="flex-1 py-2 rounded-lg text-blue-600 text-sm font-semibold border border-blue-200 hover:bg-blue-50 transition-colors">
          Edit Profile
        </button>
        <button className="flex-1 py-2 rounded-lg text-red-500 text-sm font-semibold border border-red-200 hover:bg-red-50 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardArtifact() {
  const [activeNav, setActiveNav]       = useState("Dashboard");
  const [collapsed, setCollapsed]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function h(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  return (
    <div className="h-screen flex overflow-hidden bg-[#f5f7fb] font-sans">
      <Sidebar active={activeNav} onNav={setActiveNav} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 flex-shrink-0">
          <h1 className="text-xl font-extrabold text-slate-800">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500">
              {new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
            </span>
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
              + New Deal
            </button>
            {/* Bell */}
            <button className="relative p-2 rounded-xl hover:bg-white/70 transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(v=>!v)}
                className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800 hover:ring-2 hover:ring-amber-300 transition-all select-none">
                SK
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-12 z-50">
                  <ProfileDropdown />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
          {/* KPI */}
          <div className="grid grid-cols-4 gap-4">
            {KPI.map(k => (
              <div key={k.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400 font-medium">{k.label}</p>
                  <span className="text-xl">{k.icon}</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-800">{k.value}</p>
                <p className={`text-xs mt-1 font-semibold ${k.subColor}`}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Pipeline + Activities */}
          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800">Pipeline by Stage</h2>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View all →</button>
              </div>
              <div className="space-y-4">
                {STAGES.map(s => (
                  <div key={s.label} className="flex items-center gap-4">
                    <span className={`text-xs font-bold w-24 flex-shrink-0 ${s.text}`}>{s.label}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar}`} style={{width:`${s.pct}%`}} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-28 text-right">{s.count} deals · {s.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-4 gap-3">
                {FUNNEL.map(f => (
                  <div key={f.label} className={`rounded-xl px-3 py-2.5 text-center ${f.bg}`}>
                    <p className={`text-xl font-extrabold ${f.text}`}>{f.value}</p>
                    <p className={`text-[11px] font-semibold mt-0.5 ${f.text}`}>{f.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800">Recent Activities</h2>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View all →</button>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-64">
                {ACTIVITIES.map((a,i) => (
                  <div key={i} className="flex gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm ${a.bg}`}>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-snug truncate">{a.note}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">Tasks Overview</h2>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View →</button>
              </div>
              <div className="space-y-2">
                {TASKS.map(t => (
                  <div key={t.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{t.label}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${t.color}`}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">Invoice Summary</h2>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View →</button>
              </div>
              <div className="space-y-2">
                {INVOICES.map(inv => (
                  <div key={inv.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{inv.label}</span>
                    <span className={`text-xs font-bold ${inv.color}`}>{inv.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">Projects</h2>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View →</button>
              </div>
              <div className="space-y-2">
                {PROJECTS.map(p => (
                  <div key={p.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{p.label}</span>
                    <span className={`text-xs font-bold ${p.color}`}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
