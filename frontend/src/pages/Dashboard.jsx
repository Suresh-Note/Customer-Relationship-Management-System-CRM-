import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Tooltip } from "../components/ui/Tooltip";
import axios from "../api/axios";

const STAGE_ORDER  = ["Prospecting","Qualified","Proposal","Negotiation","Closed Won"];
const STAGE_COLORS = { Prospecting:"bg-blue-400", Qualified:"bg-teal-400", Proposal:"bg-violet-400", Negotiation:"bg-amber-400", "Closed Won":"bg-green-500" };
const STAGE_TEXT   = { Prospecting:"text-blue-600", Qualified:"text-teal-600", Proposal:"text-violet-600", Negotiation:"text-amber-600", "Closed Won":"text-green-600" };
const STAGE_HEX    = { Prospecting:"#60a5fa", Qualified:"#2dd4bf", Proposal:"#a78bfa", Negotiation:"#fbbf24", "Closed Won":"#4ade80" };

function PipeDonut({ stages }) {
  const [hovered, setHovered] = useState(null);
  const total = stages.reduce((s, p) => s + p.value, 0);
  if (!total) return null;
  const R = 58, r = 34, cx = 80, cy = 80;
  const circumference = 2 * Math.PI * R;
  let cumLen = 0;
  const slices = stages.map(p => {
    const dashLen = (p.value / total) * circumference;
    const dashOffset = circumference - cumLen;
    cumLen += dashLen;
    return { ...p, dashLen, dashOffset, color: STAGE_HEX[p.label] };
  });
  const active = hovered != null ? slices[hovered] : null;
  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
        {slices.map((s, i) => (
          <circle key={s.label} cx={cx} cy={cy} r={R} fill="none"
            stroke={s.color} strokeWidth={hovered===i ? 26 : 22}
            strokeDasharray={`${s.dashLen - 2} ${circumference - s.dashLen + 2}`}
            strokeDashoffset={s.dashOffset}
            style={{ transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px`, transition:"stroke-width 0.15s", cursor:"pointer" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* Donut hole */}
        <circle cx={cx} cy={cy} r={r} fill="white" />
        {/* Center label */}
        {active ? (
          <>
            <text x={cx} y={cy-6} textAnchor="middle" fontSize="9" fill="#64748b">{active.label}</text>
            <text x={cx} y={cy+7} textAnchor="middle" fontSize="12" fontWeight="700" fill={active.color}>{fmt(active.value)}</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy-5} textAnchor="middle" fontSize="9" fill="#94a3b8">Pipeline</text>
            <text x={cx} y={cy+8} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1e293b">{fmt(total)}</text>
          </>
        )}
      </svg>
      {/* Legend */}
      <div className="flex-1 space-y-2.5">
        {slices.map((s, i) => (
          <div key={s.label}
            className={`flex items-center justify-between rounded-lg px-2 py-1 transition-colors cursor-default ${hovered===i ? "bg-slate-50" : ""}`}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">{s.count} deals · {fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
const STAGE_TIP    = { Prospecting:"Initial contact made — evaluating fit", Qualified:"Confirmed interest and budget alignment", Proposal:"Proposal/quote sent to the client", Negotiation:"Final terms being discussed — close is near", "Closed Won":"Deal successfully closed and won" };
const TYPE_EMOJI   = { Call:"📞", Email:"📧", Meeting:"🤝", Note:"📝", Task:"✅" };
const TYPE_COLOR   = { Call:"bg-blue-100 text-blue-600", Email:"bg-amber-100 text-amber-700", Meeting:"bg-green-100 text-green-700", Note:"bg-violet-100 text-violet-600", Task:"bg-rose-100 text-rose-600" };
const TYPE_TIP     = { Call:"Phone call with a lead or client", Email:"Email communication logged", Meeting:"In-person or virtual meeting", Note:"Internal note or memo", Task:"Follow-up task recorded" };

function fmt(n){ const v=Number(n||0); if(v>=10000000) return `₹${(v/10000000).toFixed(1)}Cr`; if(v>=100000) return `₹${(v/100000).toFixed(1)}L`; if(v>=1000) return `₹${(v/1000).toFixed(0)}K`; return `₹${v}`; }
function timeAgo(d){ if(!d) return ""; const h=Math.floor((Date.now()-new Date(d))/3600000); if(h<1) return "Just now"; if(h<24) return `${h}h ago`; const days=Math.floor(h/24); if(days===1) return "Yesterday"; return `${days}d ago`; }
function fullDate(d){ if(!d) return ""; return new Date(d).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }

export default function Dashboard() {
  const { onBellClick } = useOutletContext();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [leads, clients, deals, projects, tasks, invoices, activities] = await Promise.all([
          axios.get("/leads"), axios.get("/clients"), axios.get("/deals"),
          axios.get("/projects"), axios.get("/tasks"), axios.get("/invoices"), axios.get("/activities"),
        ]);
        setData({ leads: leads.data, clients: clients.data, deals: deals.data, projects: projects.data, tasks: tasks.data, invoices: invoices.data, activities: activities.data });
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading || !data) return (
    <div className="flex flex-col h-full">
      <Navbar title="Dashboard" onBellClick={onBellClick} />
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <svg className="w-7 h-7 animate-spin mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Loading dashboard…
      </div>
    </div>
  );

  const { leads, clients, deals, projects, tasks, invoices, activities } = data;

  const pipelineValue  = deals.reduce((s,d)=>s+Number(d.value||0),0);
  const openDeals      = deals.filter(d=>d.stage!=="Closed Won").length;
  const wonDeals       = deals.filter(d=>d.stage==="Closed Won");
  const wonValue       = wonDeals.reduce((s,d)=>s+Number(d.value||0),0);
  const winRate        = deals.length ? Math.round((wonDeals.length/deals.length)*100) : 0;
  const hotLeads       = leads.filter(l=>l.status==="Hot").length;
  const activeLeads    = leads.filter(l=>l.status!=="Converted").length;
  const convertedLeads = leads.filter(l=>l.status==="Converted").length;
  const overdueInv     = invoices.filter(i=>i.status==="Overdue");
  const overdueAmount  = overdueInv.reduce((s,i)=>s+Number(i.amount||0),0);
  const activeProj     = projects.filter(p=>p.status==="Active").length;

  const maxStageVal = Math.max(...STAGE_ORDER.map(s=>deals.filter(d=>d.stage===s).reduce((sum,d)=>sum+Number(d.value||0),0)), 1);
  const pipelineStages = STAGE_ORDER.map(s=>{
    const stageDeals = deals.filter(d=>d.stage===s);
    const val = stageDeals.reduce((sum,d)=>sum+Number(d.value||0),0);
    return { label:s, count:stageDeals.length, value:val, width:`${Math.round((val/maxStageVal)*100)}%` };
  });

  const statCards = [
    { label:"Pipeline Value",  value: fmt(pipelineValue), sub:`${openDeals} open deals`, subColor:"text-crm-primary", icon:"💼", tip:"Total value of all active deals in the pipeline excluding closed/won deals" },
    { label:"Won This Month",  value: fmt(wonValue),      sub:`${wonDeals.length} deals closed`, subColor:"text-green-500", icon:"🏆", tip:"Total revenue from all deals marked as Closed Won" },
    { label:"Win Rate",        value:`${winRate}%`,       sub:"Closed vs total",         subColor: winRate>=50?"text-green-500":"text-red-400", icon:"📊", tip:"Percentage of deals that were won out of all deals created" },
    { label:"Active Clients",  value: clients.length,     sub:`${hotLeads} hot leads · ${convertedLeads} converted`,   subColor:"text-amber-500", icon:"🤝", tip:`${clients.length} active clients in your CRM · ${hotLeads} leads marked as Hot · ${convertedLeads} leads converted to clients` },
  ];

  const funnelItems = [
    { label:"Leads",     value: activeLeads,       color:"bg-blue-100 text-blue-700",     tip:"Active leads in the pipeline (excludes converted)" },
    { label:"Hot",       value: hotLeads,           color:"bg-red-100 text-red-700",       tip:"Leads marked Hot — high intent, follow up immediately" },
    { label:"Deals",     value: deals.length,       color:"bg-violet-100 text-violet-700", tip:"Total deals created from leads" },
    { label:"Clients",   value: convertedLeads,     color:"bg-purple-100 text-purple-700", tip:"Leads successfully converted to client accounts" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Dashboard" onBellClick={onBellClick} rightContent={
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500">
            {new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
          </span>
          <Tooltip text="Create a new deal in the pipeline">
            <button onClick={()=>navigate("/deals")} className="px-4 py-2 rounded-xl bg-crm-primary text-white text-sm font-bold hover:bg-crm-primary/90 transition-colors">
              + New Deal
            </button>
          </Tooltip>
        </div>
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(s=>(
            <Tooltip key={s.label} text={s.tip} wide>
              <div className="stat-card w-full cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    {s.label}
                    <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-8-3a1 1 0 0 0-.867.5 1 1 0 1 1-1.731-1A3 3 0 0 1 13 10a3.001 3.001 0 0 1-2 2.83V13a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1 1 1 0 1 0 0-2zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd"/></svg>
                  </p>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
                <p className={`text-xs mt-1 font-semibold ${s.subColor}`}>{s.sub}</p>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* Pipeline + Activity Feed */}
        <div className="grid grid-cols-5 gap-5">
          {/* Pipeline by stage */}
          <div className="col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800">Pipeline by Stage</h2>
              <Tooltip text="Go to Deals page to manage all deals">
                <button onClick={()=>navigate("/deals")} className="text-xs text-crm-primary font-semibold hover:underline">View all →</button>
              </Tooltip>
            </div>
            <PipeDonut stages={pipelineStages} />

            {/* Conversion funnel */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-4 gap-3">
              {funnelItems.map(f=>(
                <Tooltip key={f.label} text={f.tip} wide>
                  <div className={`rounded-xl px-3 py-2.5 text-center w-full cursor-default ${f.color}`}>
                    <p className="text-xl font-extrabold">{f.value}</p>
                    <p className="text-[11px] font-semibold mt-0.5">{f.label}</p>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800">Recent Activities</h2>
              <Tooltip text="View all logged activities">
                <button onClick={()=>navigate("/activities")} className="text-xs text-crm-primary font-semibold hover:underline">View all →</button>
              </Tooltip>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-64">
              {activities.slice(0,8).map(a=>(
                <div key={a.activity_id} className="flex gap-3">
                  <Tooltip text={TYPE_TIP[a.type] || a.type}>
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-default ${TYPE_COLOR[a.type]||"bg-slate-100 text-slate-500"}`}>
                      {TYPE_EMOJI[a.type]||"📌"}
                    </span>
                  </Tooltip>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 leading-snug truncate">{a.notes||a.type}</p>
                    <Tooltip text={fullDate(a.activity_date)}>
                      <p className="text-[11px] text-slate-400 mt-0.5 cursor-default">{timeAgo(a.activity_date)}</p>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Tasks + Invoices + Projects */}
        <div className="grid grid-cols-3 gap-5">
          {/* Tasks summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Tasks Overview</h2>
              <Tooltip text="Go to Tasks page">
                <button onClick={()=>navigate("/tasks")} className="text-xs text-crm-primary font-semibold hover:underline">View →</button>
              </Tooltip>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  {label:"Pending",     value: tasks.filter(t=>t.status==="Pending").length,     color:"bg-slate-100 text-slate-600"},
                  {label:"In Progress", value: tasks.filter(t=>t.status==="In Progress").length, color:"bg-blue-100 text-blue-700"},
                  {label:"Completed",   value: tasks.filter(t=>t.status==="Done").length,        color:"bg-green-100 text-green-700"},
                ].map(t=>(
                  <span key={t.label} className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    {t.label} <span className={`font-bold px-2 py-0.5 rounded-full ${t.color}`}>{t.value}</span>
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <Tooltip text="High-priority tasks still open — needs immediate attention">
                  <div className="cursor-default">
                    <span className="text-xs text-slate-400">High priority </span>
                    <span className="text-xs font-bold text-red-600">{tasks.filter(t=>t.priority==="High"&&t.status!=="Done").length} open</span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Invoice summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Invoice Summary</h2>
              <Tooltip text="Go to Invoices page">
                <button onClick={()=>navigate("/invoices")} className="text-xs text-crm-primary font-semibold hover:underline">View →</button>
              </Tooltip>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1 flex-wrap text-xs font-semibold">
                <span className="text-slate-500">Paid</span><span className="text-green-600 font-bold">{fmt(invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+Number(i.amount||0),0))}</span>
                <span className="text-slate-300 mx-1">·</span>
                <span className="text-slate-500">Pending</span><span className="text-amber-600 font-bold">{fmt(invoices.filter(i=>i.status==="Pending").reduce((s,i)=>s+Number(i.amount||0),0))}</span>
                <span className="text-slate-300 mx-1">·</span>
                <span className="text-slate-500">Overdue</span><span className="text-red-600 font-bold">{fmt(overdueAmount)}</span>
              </div>
              {overdueInv.length>0 && (
                <Tooltip text={`${overdueInv.length} invoice${overdueInv.length>1?"s":""} past due date — contact clients to collect ${fmt(overdueAmount)}`} wide>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 bg-red-50 rounded-lg px-2.5 py-1.5 w-full cursor-default">
                    <span className="text-[10px] text-red-600 font-semibold">⚠ {overdueInv.length} overdue invoice{overdueInv.length>1?"s":""} — follow up now</span>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Projects summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Projects</h2>
              <Tooltip text="Go to Projects page">
                <button onClick={()=>navigate("/projects")} className="text-xs text-crm-primary font-semibold hover:underline">View →</button>
              </Tooltip>
            </div>
            <div>
              <div className="flex items-center gap-1 flex-wrap text-xs font-semibold">
                <span className="text-slate-500">Active</span><span className="text-green-600 font-bold">{activeProj}</span>
                <span className="text-slate-300 mx-1">·</span>
                <span className="text-slate-500">Planning</span><span className="text-blue-600 font-bold">{projects.filter(p=>p.status==="Planning").length}</span>
                <span className="text-slate-300 mx-1">·</span>
                <span className="text-slate-500">On Hold</span><span className="text-amber-600 font-bold">{projects.filter(p=>p.status==="On Hold").length}</span>
                <span className="text-slate-300 mx-1">·</span>
                <span className="text-slate-500">Completed</span><span className="text-slate-500 font-bold">{projects.filter(p=>p.status==="Completed").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
