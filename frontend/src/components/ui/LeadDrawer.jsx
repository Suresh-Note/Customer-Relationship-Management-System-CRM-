import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Modal from "./Modal";
import Toast from "./Toast";
import Can from "../Can";

const STATUS_COLORS = { Hot:"bg-red-100 text-red-700", Warm:"bg-amber-100 text-amber-700", Cold:"bg-blue-100 text-blue-700", New:"bg-emerald-100 text-emerald-700", Converted:"bg-purple-100 text-purple-700" };
const STATUS_NEXT   = { New:"Hot", Hot:"Warm", Warm:"Cold", Cold:"New" };
const TYPES         = ["Call","Email","Meeting","Note","Task"];
const STAGES        = ["Prospecting","Qualified","Proposal","Negotiation","Closed Won"];
const TYPE_EMOJI    = { Call:"📞", Email:"📧", Meeting:"🤝", Note:"📝", Task:"✅" };
const TYPE_COLOR    = { Call:"bg-blue-100 text-blue-600", Email:"bg-amber-100 text-amber-700", Meeting:"bg-green-100 text-green-700", Note:"bg-violet-100 text-violet-600", Task:"bg-rose-100 text-rose-600" };

function timeAgo(d){ if(!d) return ""; const diff=Date.now()-new Date(d); const m=Math.floor(diff/60000); if(m<1) return "Just now"; if(m<60) return `${m}m ago`; const h=Math.floor(m/60); if(h<24) return `${h}h ago`; const days=Math.floor(h/24); if(days===1) return "Yesterday"; return `${days}d ago`; }
function fmt(n){ const v=Number(n||0); if(v>=100000) return `₹${(v/100000).toFixed(1)}L`; if(v>=1000) return `₹${(v/1000).toFixed(0)}K`; return `₹${v}`; }

export default function LeadDrawer({ lead, onClose, onRefresh }) {
  const [activities, setActivities] = useState([]);
  const [deals, setDeals]           = useState([]);
  const [clients, setClients]       = useState([]);
  const [logOpen, setLogOpen]       = useState(false);
  const [dealOpen, setDealOpen]     = useState(false);
  const [logForm, setLogForm]       = useState({ type:"Call", notes:"" });
  const [dealForm, setDealForm]     = useState({ deal_name:"", value:"", stage:"Prospecting", probability:"", expected_close:"" });
  const [saving, setSaving]         = useState(false);
  const [converting, setConverting] = useState(false);
  const [toast, setToast]           = useState(null);
  const showToast = (message,type="success") => setToast({message,type});

  useEffect(() => {
    if (!lead) return;
    axios.get("/activities").then(r => setActivities(r.data.filter(a => a.lead_id === lead.lead_id)));
    axios.get("/deals").then(r => setDeals(r.data.filter(d => d.lead_id === lead.lead_id)));
    axios.get("/clients").then(r => setClients(r.data));
  }, [lead]);

  if (!lead) return null;

  const isClient = clients.some(c => c.email === lead.email || c.company_name === lead.company);

  // Log Activity
  const handleLogActivity = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post("/activities", { lead_id: lead.lead_id, type: logForm.type, notes: logForm.notes });
      showToast("Activity logged");
      setLogOpen(false);
      setLogForm({ type:"Call", notes:"" });
      const r = await axios.get("/activities");
      setActivities(r.data.filter(a => a.lead_id === lead.lead_id));
      onRefresh?.();
    } catch { showToast("Failed to log activity","error"); }
    finally { setSaving(false); }
  };

  // Create Deal from lead
  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!dealForm.deal_name || !dealForm.value) return;
    setSaving(true);
    try {
      await axios.post("/deals", { ...dealForm, value: Number(dealForm.value), lead_id: lead.lead_id });
      showToast("Deal created!");
      setDealOpen(false);
      setDealForm({ deal_name:"", value:"", stage:"Prospecting", probability:"", expected_close:"" });
      const r = await axios.get("/deals");
      setDeals(r.data.filter(d => d.lead_id === lead.lead_id));
      onRefresh?.();
    } catch { showToast("Failed to create deal","error"); }
    finally { setSaving(false); }
  };

  // Convert Lead → Client
  const handleConvert = async () => {
    if (!window.confirm(`Convert "${lead.name}" (${lead.company}) to a client?\n\nThis will:\n• Create a new client record\n• Mark this lead as "Converted"\n• Link any existing deals to the new client`)) return;
    setConverting(true);
    try {
      const { data } = await axios.post(`/leads/${lead.lead_id}/convert`);
      showToast(`✅ ${lead.company} converted to client!`);
      onRefresh?.();
      onClose?.();
    } catch (err) { showToast(err?.response?.data?.error || "Conversion failed","error"); }
    finally { setConverting(false); }
  };

  // Update lead status
  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`/leads/${lead.lead_id}`, { name:lead.name, email:lead.email, phone:lead.phone, company:lead.company, source:lead.source, service_interest:lead.service_interest, status:newStatus });
      showToast(`Status → ${newStatus}`);
      onRefresh?.();
    } catch { showToast("Update failed","error"); }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[480px] bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-crm-primary to-blue-600 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg">
                {lead.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-tight">{lead.name}</h2>
                <p className="text-blue-100 text-sm">{lead.company}</p>
                <p className="text-blue-200 text-xs mt-0.5">{lead.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Status row */}
          <div className="flex items-center gap-2 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[lead.status]||"bg-slate-100 text-slate-600"}`}>{lead.status}</span>
            {lead.status !== "Converted" && (
              <Can roles={["Sales", "Manager", "Admin"]}>
                <>
                  <span className="text-blue-200 text-xs">→</span>
                  {Object.keys(STATUS_COLORS).filter(s=>s!==lead.status && s!=="Converted").map(s=>(
                    <button key={s} onClick={()=>updateStatus(s)} className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/25 text-white text-xs font-medium transition-colors">{s}</button>
                  ))}
                </>
              </Can>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex gap-2 flex-wrap">
          <Can roles={["Sales", "Developer", "Marketing", "Manager", "Admin"]}>
            <button onClick={()=>setLogOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crm-primary text-white text-xs font-semibold hover:bg-crm-primary/90 transition-colors">
              📞 Log Activity
            </button>
          </Can>
          <Can roles={["Sales", "Manager", "Admin"]}>
            <button onClick={()=>setDealOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors">
              💼 Create Deal
            </button>
          </Can>
          {lead.status === "Converted" || isClient ? (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold">✅ Converted to Client</span>
          ) : (
            <Can roles={["Manager", "Admin"]}>
              <button onClick={handleConvert} disabled={converting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60">
                {converting ? "Converting…" : "⭐ Convert to Client"}
              </button>
            </Can>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Lead Details */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Lead Details</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                { label:"Phone",    value: lead.phone||"—" },
                { label:"Source",   value: lead.source||"—" },
                { label:"Service",  value: lead.service_interest||"—" },
                { label:"Added",    value: lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-IN") : "—" },
              ].map(f=>(
                <div key={f.label}>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deals linked to this lead */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              Deals <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">{deals.length}</span>
            </h3>
            {deals.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">No deals yet</p>
                <button onClick={()=>setDealOpen(true)} className="text-xs text-crm-primary font-semibold mt-1 hover:underline">Create first deal →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {deals.map(d=>(
                  <div key={d.deal_id} className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{d.deal_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{d.stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-crm-primary">{fmt(d.value)}</p>
                      <p className="text-xs text-slate-400">{d.probability||0}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              Activity Timeline <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">{activities.length}</span>
            </h3>
            {activities.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">No activities yet</p>
                <button onClick={()=>setLogOpen(true)} className="text-xs text-crm-primary font-semibold mt-1 hover:underline">Log first activity →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(a=>(
                  <div key={a.activity_id} className="flex gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-base ${TYPE_COLOR[a.type]||"bg-slate-100"}`}>
                      {TYPE_EMOJI[a.type]||"📌"}
                    </span>
                    <div className="flex-1 bg-white border border-slate-100 rounded-xl px-3 py-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-slate-700">{a.type}</span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(a.activity_date)}</span>
                      </div>
                      {a.notes && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Activity modal */}
      <Modal open={logOpen} onClose={()=>setLogOpen(false)} title="Log Activity">
        <form onSubmit={handleLogActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Type</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t=>(
                <button key={t} type="button" onClick={()=>setLogForm(f=>({...f,type:t}))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${logForm.type===t?"bg-crm-primary text-white border-crm-primary":"border-slate-200 text-slate-600 hover:border-crm-primary"}`}>
                  {TYPE_EMOJI[t]} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea value={logForm.notes} onChange={e=>setLogForm(f=>({...f,notes:e.target.value}))} rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 resize-none"
              placeholder="What happened? Key points discussed…" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>setLogOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold disabled:opacity-60">{saving?"Saving…":"Log Activity"}</button>
          </div>
        </form>
      </Modal>

      {/* Create Deal modal */}
      <Modal open={dealOpen} onClose={()=>setDealOpen(false)} title={`New Deal — ${lead.name}`}>
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Deal Name <span className="text-red-400">*</span></label>
            <input value={dealForm.deal_name} onChange={e=>setDealForm(f=>({...f,deal_name:e.target.value}))} placeholder={`${lead.company} — ${lead.service_interest||"Deal"}`}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Value (₹) <span className="text-red-400">*</span></label>
              <input type="number" value={dealForm.value} onChange={e=>setDealForm(f=>({...f,value:e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Probability %</label>
              <input type="number" min="0" max="100" value={dealForm.probability} onChange={e=>setDealForm(f=>({...f,probability:e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Stage</label>
              <select value={dealForm.stage} onChange={e=>setDealForm(f=>({...f,stage:e.target.value}))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
                {STAGES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Close</label>
              <input type="date" value={dealForm.expected_close} onChange={e=>setDealForm(f=>({...f,expected_close:e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>setDealOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving||!dealForm.deal_name||!dealForm.value} className="px-5 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold disabled:opacity-60">{saving?"Creating…":"Create Deal"}</button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={()=>setToast(null)} />
    </>
  );
}
