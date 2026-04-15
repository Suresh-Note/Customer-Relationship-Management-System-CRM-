import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip, DealContactTip } from "../components/ui/Tooltip";
import Can from "../components/Can";
import axios from "../api/axios";

const STAGES   = ["Prospecting", "Qualified", "Proposal", "Negotiation", "Closed Won"];
const PRIORITIES = ["Low", "Medium", "High"];
const stageColors = { "Prospecting": "border-blue-300", "Qualified": "border-teal-400", "Proposal": "border-violet-400", "Negotiation": "border-amber-400", "Closed Won": "border-green-400" };
const priorityColors = { High: "bg-red-100 text-red-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-blue-100 text-blue-700" };

const INIT = { deal_name: "", value: "", stage: "Prospecting", probability: "", expected_close: "", lead_id: "", client_id: "" };

function validate(f) {
  const e = {};
  if (!f.deal_name.trim()) e.deal_name = "Deal name is required";
  if (!f.value || isNaN(f.value) || Number(f.value) <= 0) e.value = "Enter a valid amount";
  if (!f.stage) e.stage = "Stage is required";
  if (f.probability !== "" && (isNaN(f.probability) || Number(f.probability) < 0 || Number(f.probability) > 100)) e.probability = "0–100";
  return e;
}

function formatLakhs(v) {
  const n = Number(v || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function Deals() {
  const { onBellClick } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [deals, setDeals]         = useState([]);
  const [leads, setLeads]         = useState([]);
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState("kanban");
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(INIT);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [d, l, c] = await Promise.all([
        axios.get("/deals"),
        axios.get("/leads"),
        axios.get("/clients"),
      ]);
      setDeals(d.data);
      setLeads(l.data);
      setClients(c.data);
    } catch {
      showToast("Failed to load deals", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!location.state?.notificationTitle) return;

    if (location.state.notificationSearch) {
      setSearch(location.state.notificationSearch);
    }

    setToast({ message: `${location.state.notificationTitle} opened`, type: "success" });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const openAdd  = () => { setEditItem(null); setForm(INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (d) => {
    setEditItem(d);
    setForm({ deal_name: d.deal_name || "", value: d.value || "", stage: d.stage || "Prospecting", probability: d.probability ?? "", expected_close: d.expected_close ? d.expected_close.slice(0, 10) : "", lead_id: d.lead_id || "", client_id: d.client_id || "" });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, value: Number(form.value), probability: form.probability !== "" ? Number(form.probability) : null, lead_id: form.lead_id || null, client_id: form.client_id || null };
      if (editItem) {
        await axios.put(`/deals/${editItem.deal_id}`, payload);
        showToast("Deal updated");
      } else {
        await axios.post("/deals", payload);
        showToast("Deal created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStage = async (deal, newStage) => {
    try {
      await axios.put(`/deals/${deal.deal_id}`, { ...deal, stage: newStage, value: Number(deal.value), probability: deal.probability !== "" ? Number(deal.probability) : null, lead_id: deal.lead_id || null, client_id: deal.client_id || null });
      showToast(`Moved to ${newStage} ✓`);
      load();
    } catch { showToast("Stage update failed", "error"); }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete deal "${d.deal_name}"?`)) return;
    setDeleting(d.deal_id);
    try {
      await axios.delete(`/deals/${d.deal_id}`);
      showToast("Deal deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = search
    ? deals.filter(d => `${d.deal_name} ${d.stage}`.toLowerCase().includes(search.toLowerCase()))
    : deals;

  const pipelineValue = deals.reduce((s, d) => s + Number(d.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === "Closed Won");
  const wonValue = wonDeals.reduce((s, d) => s + Number(d.value || 0), 0);
  const avgDeal = deals.length ? Math.round(pipelineValue / deals.length) : 0;

  const Field = ({ label, name, type = "text", required, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children || <input name={name} type={type} value={form[name]} onChange={handleChange}
        className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors[name] ? "border-red-400" : "border-slate-200"}`} />}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Deals" onBellClick={onBellClick} rightContent={
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals…" className="w-44 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-crm-primary/30" />
          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
            {["kanban","list"].map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-2 text-xs font-bold capitalize transition-colors ${view === v ? "bg-crm-primary text-white" : "text-slate-500 hover:bg-slate-50"}`}>{v}</button>
            ))}
          </div>
          <Can roles={["Sales", "Manager", "Admin"]}>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New Deal
            </button>
          </Can>
        </div>
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pipeline Value", value: formatLakhs(pipelineValue), sub: `${deals.length} open deals`, c: "text-crm-primary", tip: "Total combined value of all deals currently in the pipeline" },
            { label: "Won This Month", value: formatLakhs(wonValue), sub: `${wonDeals.length} deals closed`, c: "text-green-500", tip: "Revenue from deals marked Closed Won — successfully converted" },
            { label: "Avg Deal Size", value: formatLakhs(avgDeal), sub: "Across all deals", c: "text-slate-400", tip: "Average monetary value per deal across your entire pipeline" },
            { label: "In Negotiation", value: deals.filter(d => d.stage === "Negotiation").length, sub: "Close to closing", c: "text-amber-500", tip: "Deals currently in negotiation stage — high chance of closing soon" },
          ].map(s => (
            <Tooltip key={s.label} text={s.tip} wide>
              <div className="stat-card w-full cursor-default">
                <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? "—" : s.value}</p>
                <p className={`text-xs mt-1 font-medium ${s.c}`}>{s.sub}</p>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* Kanban / List */}
        {loading ? (
          <div className="py-20 flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading deals…
          </div>
        ) : view === "kanban" ? (
          <KanbanView deals={filtered} leads={leads} clients={clients} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} onMoveStage={handleMoveStage} />
        ) : (
          <ListView deals={filtered} leads={leads} clients={clients} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Deal" : "New Deal"} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Deal Name" name="deal_name" required />
            </div>
            <Field label="Value (₹)" name="value" type="number" required />
            <Field label="Probability (%)" name="probability" type="number" />
            <Field label="Stage" name="stage" required>
              <select name="stage" value={form.stage} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.stage ? "border-red-400" : "border-slate-200"}`}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Expected Close" name="expected_close" type="date" />
            <Field label="Lead (optional)" name="lead_id">
              <select name="lead_id" value={form.lead_id} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
                <option value="">None</option>
                {leads.map(l => <option key={l.lead_id} value={l.lead_id}>{l.name} — {l.company}</option>)}
              </select>
            </Field>
            <Field label="Client (optional)" name="client_id">
              <select name="client_id" value={form.client_id} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
                <option value="">None</option>
                {clients.map(c => <option key={c.client_id} value={c.client_id}>{c.company_name}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update" : "Create Deal"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}

function getContactInfo(deal, leads, clients) {
  const lead   = deal.lead_id   ? leads.find(l => l.lead_id === deal.lead_id)       : null;
  const client = deal.client_id ? clients.find(c => c.client_id === deal.client_id) : null;
  if (lead)   return { name: lead.name,             company: lead.company,      type: "Lead" };
  if (client) return { name: client.contact_person, company: client.company_name, type: "Client" };
  return null;
}

function ContactBadge({ contact }) {
  if (!contact) return null;
  const initials = (contact.name || contact.company || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const typeClr  = contact.type === "Lead" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700";
  return (
    <div className="flex items-center gap-1.5 mt-2 mb-1">
      <span className={`w-5 h-5 rounded-full ${typeClr} flex items-center justify-center text-[9px] font-bold flex-shrink-0`}>{initials}</span>
      <span className="text-[11px] text-slate-500 truncate">{contact.name || contact.company}</span>
      <span className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${typeClr}`}>{contact.type}</span>
    </div>
  );
}

function KanbanView({ deals, leads, clients, onEdit, onDelete, deleting, onMoveStage }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {STAGES.map(stage => {
        const cards = deals.filter(d => d.stage === stage);
        const total = cards.reduce((s, d) => s + Number(d.value || 0), 0);
        return (
          <div key={stage} className="flex flex-col">
            <div className={`border-t-[3px] ${stageColors[stage]} rounded-t mb-3`} />
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-700">{stage}</h3>
              <div className="text-xs text-slate-400">{cards.length} deals · {formatLakhs(total)}</div>
            </div>
            <div className="flex flex-col gap-3">
              {cards.length === 0 && <div className="text-xs text-slate-300 py-4 text-center">No deals</div>}
              {cards.map(deal => {
                const contact = getContactInfo(deal, leads, clients);
                return (
                <div key={deal.deal_id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card hover:shadow-md transition-shadow">
                  <DealContactTip deal={deal} leads={leads} clients={clients}>
                    <div className="text-sm font-semibold text-slate-800 leading-snug cursor-default">{deal.deal_name}</div>
                  </DealContactTip>
                  <ContactBadge contact={contact} />
                  <div className="text-xs text-slate-400 mt-0.5">{deal.stage}</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-crm-primary">{formatLakhs(deal.value)}</span>
                    <span className="text-xs text-slate-400">{deal.probability ?? 0}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-2">
                    <div className={`h-full rounded-full ${Number(deal.probability) >= 80 ? "bg-green-400" : Number(deal.probability) >= 50 ? "bg-blue-400" : "bg-blue-300"}`} style={{ width: `${deal.probability || 0}%` }} />
                  </div>
                  {/* Move to next stage */}
                  {stage !== "Closed Won" && (
                    <Can roles={["Sales", "Manager", "Admin"]}>
                      <Tooltip text={`Advance to: ${STAGES[STAGES.indexOf(stage) + 1]}`}>
                        <button onClick={() => onMoveStage(deal, STAGES[STAGES.indexOf(stage) + 1])}
                          className="w-full mt-2 text-xs py-1.5 rounded-lg bg-crm-primary/5 text-crm-primary hover:bg-crm-primary/15 font-semibold transition-colors flex items-center justify-center gap-1">
                          → {STAGES[STAGES.indexOf(stage) + 1]}
                        </button>
                      </Tooltip>
                    </Can>
                  )}
                  <div className="flex gap-1 mt-1.5">
                    <Can roles={["Sales", "Manager", "Admin"]}>
                      <Tooltip text="Edit deal details">
                        <button onClick={() => onEdit(deal)} className="flex-1 text-xs py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                      </Tooltip>
                    </Can>
                    <Can roles={["Manager", "Admin"]}>
                      <Tooltip text="Permanently delete this deal">
                        <button onClick={() => onDelete(deal)} disabled={deleting === deal.deal_id} className="flex-1 text-xs py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
                          {deleting === deal.deal_id ? "…" : "Del"}
                        </button>
                      </Tooltip>
                    </Can>
                  </div>
                </div>
              );})}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ deals, leads, clients, onEdit, onDelete, deleting }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      {deals.length === 0 ? (
        <div className="py-14 flex flex-col items-center text-slate-400"><span className="text-4xl mb-3">🤝</span><p className="text-sm">No deals found</p></div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Deal Name", "Contact", "Value", "Stage", "Probability", "Expected Close", "Actions"].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {deals.map(d => {
              const contact = getContactInfo(d, leads, clients);
              return (
              <tr key={d.deal_id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-800">
                  <DealContactTip deal={d} leads={leads} clients={clients}>
                    <span className="cursor-default">{d.deal_name}</span>
                  </DealContactTip>
                </td>
                <td className="px-5 py-3.5">
                  {contact ? (
                    <DealContactTip deal={d} leads={leads} clients={clients}>
                      <div className="flex items-center gap-2 cursor-default">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${contact.type === "Lead" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {(contact.name || contact.company || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-700 leading-tight">{contact.name || "—"}</p>
                          <p className="text-[10px] text-slate-400">{contact.type}</p>
                        </div>
                      </div>
                    </DealContactTip>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </td>
                <td className="px-5 py-3.5 font-bold text-crm-primary">{formatLakhs(d.value)}</td>
                <td className="px-5 py-3.5"><span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{d.stage}</span></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-crm-primary rounded-full" style={{ width: `${d.probability || 0}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{d.probability ?? 0}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{d.expected_close ? d.expected_close.slice(0, 10) : "—"}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <Can roles={["Sales", "Manager", "Admin"]}>
                      <Tooltip text="Edit deal details">
                        <button onClick={() => onEdit(d)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
                      </Tooltip>
                    </Can>
                    <Can roles={["Manager", "Admin"]}>
                      <Tooltip text="Permanently delete this deal">
                        <button onClick={() => onDelete(d)} disabled={deleting === d.deal_id} className="px-2.5 py-1 rounded-lg bg-red-50 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50">
                          {deleting === d.deal_id ? "…" : "Delete"}
                        </button>
                      </Tooltip>
                    </Can>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      )}
    </div>
  );
}
