import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip, LeadAvatarTip } from "../components/ui/Tooltip";
import LeadDrawer from "../components/ui/LeadDrawer";
import Can from "../components/Can";
import axios from "../api/axios";

const STATUSES = ["New", "Hot", "Warm", "Cold"];
const SOURCES = ["LinkedIn", "Referral", "Website", "Cold email", "Webinar", "Other"];
const LEAD_FILTERS = ["All", "Hot", "Warm", "Cold", "New"];

const statusColors = {
  Hot:       "bg-red-100 text-red-700",
  Warm:      "bg-amber-100 text-amber-700",
  Cold:      "bg-blue-100 text-blue-700",
  New:       "bg-emerald-100 text-emerald-700",
  Converted: "bg-purple-100 text-purple-700",
};
const avatarColors = [
  "bg-blue-200 text-blue-800","bg-emerald-200 text-emerald-800",
  "bg-amber-200 text-amber-800","bg-rose-200 text-rose-800","bg-violet-200 text-violet-800",
];

const INIT = { name: "", email: "", phone: "", company: "", source: "", service_interest: "", status: "New" };

function validate(f) {
  const e = {};
  if (!f.name.trim())    e.name    = "Name is required";
  if (!f.email.trim())   e.email   = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email";
  if (!f.company.trim()) e.company = "Company is required";
  if (!f.status)         e.status  = "Status is required";
  return e;
}

function getInitials(n) { return n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

export default function Leads() {
  const { onBellClick } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("leads"); // "leads" | "converted"
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(INIT);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [drawerLead, setDrawerLead] = useState(null);
  const [sortKey, setSortKey]       = useState(null);
  const [sortDir, setSortDir]       = useState("asc");

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeToast = () => setToast(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/leads");
      setLeads(data);
    } catch {
      showToast("Failed to load leads", "error");
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

  const openAdd = () => { setEditItem(null); setForm(INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (lead) => { setEditItem(lead); setForm({ name: lead.name || "", email: lead.email || "", phone: lead.phone || "", company: lead.company || "", source: lead.source || "", service_interest: lead.service_interest || "", status: lead.status || "New" }); setErrors({}); setModalOpen(true); };

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
      if (editItem) {
        await axios.put(`/leads/${editItem.lead_id}`, form);
        showToast("Lead updated successfully");
      } else {
        await axios.post("/leads", form);
        showToast("Lead added successfully");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete lead "${lead.name}"?`)) return;
    setDeleting(lead.lead_id);
    try {
      await axios.delete(`/leads/${lead.lead_id}`);
      showToast("Lead deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  // Split data
  const activeLeads    = leads.filter(l => l.status !== "Converted");
  const convertedLeads = leads.filter(l => l.status === "Converted");

  const filtered = (view === "converted" ? convertedLeads : activeLeads)
    .filter((l) => {
      if (view === "leads" && filter !== "All" && l.status !== filter) return false;
      if (search && !`${l.name} ${l.email} ${l.company}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const counts = LEAD_FILTERS.reduce((acc, f) => { acc[f] = f === "All" ? activeLeads.length : activeLeads.filter(l => l.status === f).length; return acc; }, {});
  const hot = activeLeads.filter(l => l.status === "Hot").length;

  const Field = ({ label, name, type = "text", required, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children || <input name={name} type={type} value={form[name]} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors[name] ? "border-red-400" : "border-slate-200"}`} />}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  // Table columns differ by view
  const leadsColumns = [
    { label: "Name",             key: "name"             },
    { label: "Company",          key: "company"          },
    { label: "Source",           key: "source"           },
    { label: "Status",           key: "status"           },
    { label: "Service Interest", key: "service_interest" },
    { label: "Actions",          key: null               },
  ];
  const convertedColumns = [
    { label: "Name",             key: "name"             },
    { label: "Company",          key: "company"          },
    { label: "Email",            key: "email"            },
    { label: "Source",           key: "source"           },
    { label: "Service Interest", key: "service_interest" },
    { label: "Converted On",     key: "updated_at"       },
    { label: "Actions",          key: null               },
  ];
  const columns = view === "converted" ? convertedColumns : leadsColumns;

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Leads" onBellClick={onBellClick} rightContent={
        view === "leads" ? (
          <Can roles={["Sales", "Manager", "Admin"]}>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Lead
            </button>
          </Can>
        ) : null
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {view === "leads" ? (
            <>
              <Tooltip text="Leads currently in your pipeline (excludes converted)">
                <div className="stat-card w-full cursor-default">
                  <p className="text-xs text-slate-400 font-medium mb-1">Active Leads</p>
                  <p className="text-2xl font-bold text-slate-800">{loading ? "—" : activeLeads.length}</p>
                  <p className="text-xs mt-1 font-medium text-slate-400">In pipeline</p>
                </div>
              </Tooltip>
              <Tooltip text="Leads marked Hot — highest priority, need immediate follow-up">
                <div className="stat-card w-full cursor-default">
                  <p className="text-xs text-slate-400 font-medium mb-1">Hot Leads</p>
                  <p className="text-2xl font-bold text-slate-800">{loading ? "—" : hot}</p>
                  <p className="text-xs mt-1 font-medium text-red-500">Action needed</p>
                </div>
              </Tooltip>
              <Tooltip text="Leads successfully converted into client accounts">
                <div className="stat-card w-full cursor-default">
                  <p className="text-xs text-slate-400 font-medium mb-1">Converted</p>
                  <p className="text-2xl font-bold text-slate-800">{loading ? "—" : leads.length ? `${convertedLeads.length} (${Math.round((convertedLeads.length / leads.length) * 100)}%)` : "0"}</p>
                  <p className="text-xs mt-1 font-medium text-purple-500">Moved to clients</p>
                </div>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip text="Total leads that have been converted to client accounts">
                <div className="stat-card w-full cursor-default border-purple-100">
                  <p className="text-xs text-purple-400 font-medium mb-1">Total Converted</p>
                  <p className="text-2xl font-bold text-purple-700">{loading ? "—" : convertedLeads.length}</p>
                  <p className="text-xs mt-1 font-medium text-purple-400">Now clients</p>
                </div>
              </Tooltip>
              <Tooltip text="Conversion rate — percentage of leads that became clients">
                <div className="stat-card w-full cursor-default border-purple-100">
                  <p className="text-xs text-purple-400 font-medium mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-700">{loading ? "—" : leads.length ? `${Math.round((convertedLeads.length / leads.length) * 100)}%` : "0%"}</p>
                  <p className="text-xs mt-1 font-medium text-purple-400">Of all leads</p>
                </div>
              </Tooltip>
              <Tooltip text="Leads still in the active pipeline waiting to convert">
                <div className="stat-card w-full cursor-default">
                  <p className="text-xs text-slate-400 font-medium mb-1">Remaining Leads</p>
                  <p className="text-2xl font-bold text-slate-800">{loading ? "—" : activeLeads.length}</p>
                  <p className="text-xs mt-1 font-medium text-slate-400">Still in pipeline</p>
                </div>
              </Tooltip>
            </>
          )}
        </div>

        {/* View Toggle + Filters + Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary view toggle: Leads | Converted to Clients */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setView("leads"); setFilter("All"); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "leads"
                  ? "bg-white text-crm-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Leads
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === "leads" ? "bg-crm-primary/10 text-crm-primary" : "bg-slate-200 text-slate-500"}`}>{activeLeads.length}</span>
            </button>
            <button
              onClick={() => { setView("converted"); setFilter("All"); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "converted"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Converted to Clients
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === "converted" ? "bg-purple-100 text-purple-600" : "bg-slate-200 text-slate-500"}`}>{convertedLeads.length}</span>
            </button>
          </div>

          {/* Status sub-filters — only for leads view */}
          {view === "leads" && (
            <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
              {LEAD_FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-white text-crm-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-crm-primary/10 text-crm-primary" : "bg-slate-200 text-slate-500"}`}>{counts[f]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={view === "converted" ? "Search converted…" : "Search leads…"} className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-crm-primary/30 w-56" />
          </div>
        </div>

        {/* Table */}
        <div className={`bg-white rounded-2xl border shadow-card overflow-hidden ${view === "converted" ? "border-purple-100" : "border-slate-100"}`}>
          {loading ? (
            <div className="py-16 flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-slate-400">
              <span className="text-4xl mb-3">{view === "converted" ? "✅" : "📋"}</span>
              <p className="text-sm font-medium">
                {view === "converted"
                  ? (search ? "No converted leads match your search" : "No leads converted yet — convert from the Leads view!")
                  : (search || filter !== "All" ? "No leads match your filter" : "No leads yet — add your first one!")
                }
              </p>
              {view === "converted" && !search && (
                <button onClick={() => { setView("leads"); setFilter("All"); }} className="mt-2 text-sm text-crm-primary font-semibold hover:underline">
                  ← Go to Leads
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${view === "converted" ? "border-purple-50" : "border-slate-100"}`}>
                  {columns.map(({ label, key }) => (
                    <th key={label}
                      className={`table-header select-none ${key ? "cursor-pointer hover:text-crm-primary" : ""}`}
                      onClick={() => key && toggleSort(key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {key && (
                          <span className="flex flex-col leading-none">
                            <svg className={`w-2.5 h-2.5 ${sortKey === key && sortDir === "asc" ? "text-crm-primary" : "text-slate-300"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                            <svg className={`w-2.5 h-2.5 ${sortKey === key && sortDir === "desc" ? "text-crm-primary" : "text-slate-300"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((lead, i) => (
                  <tr key={lead.lead_id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => setDrawerLead(lead)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <LeadAvatarTip lead={lead} color={avatarColors[i % avatarColors.length]}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>{getInitials(lead.name)}</span>
                        </LeadAvatarTip>
                        <div>
                          <div className="font-semibold text-slate-800">{lead.name}</div>
                          <div className="text-xs text-slate-400">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{lead.company}</td>

                    {/* Leads view columns */}
                    {view === "leads" && (
                      <>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{lead.source || "—"}</td>
                        <td className="px-5 py-3.5">
                          <Tooltip text={`Status: ${lead.status} — ${lead.status === "Hot" ? "immediate follow-up needed" : lead.status === "New" ? "just added, not yet contacted" : lead.status === "Warm" ? "engaged, moderate interest" : lead.status === "Cold" ? "low interest, needs nurturing" : "unknown"}`} wide>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-default ${statusColors[lead.status] || "bg-slate-100 text-slate-600"}`}>{lead.status}</span>
                          </Tooltip>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[160px]">
                          <Tooltip text={lead.service_interest || "No service interest specified"} wide>
                            <span className="truncate block max-w-[160px] cursor-default">{lead.service_interest || "—"}</span>
                          </Tooltip>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5">
                            <Tooltip text="View full lead details">
                              <button onClick={(e) => { e.stopPropagation(); setDrawerLead(lead); }} className="px-2.5 py-1 rounded-lg bg-crm-primary/5 text-xs font-medium text-crm-primary hover:bg-crm-primary/10 transition-colors">View</button>
                            </Tooltip>
                            <Can roles={["Sales", "Manager", "Admin"]}>
                              <Tooltip text="Edit this lead">
                                <button onClick={(e) => { e.stopPropagation(); openEdit(lead); }} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
                              </Tooltip>
                            </Can>
                            <Can roles={["Manager", "Admin"]}>
                              <Tooltip text="Permanently delete this lead">
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(lead); }} disabled={deleting === lead.lead_id} className="px-2.5 py-1 rounded-lg bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                                  {deleting === lead.lead_id ? "…" : "Delete"}
                                </button>
                              </Tooltip>
                            </Can>
                          </div>
                        </td>
                      </>
                    )}

                    {/* Converted view columns */}
                    {view === "converted" && (
                      <>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{lead.email || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{lead.source || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[160px]">
                          <span className="truncate block max-w-[160px]">{lead.service_interest || "—"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-purple-600 font-medium">
                            {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5 items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Client
                            </span>
                            <Tooltip text="View conversion details">
                              <button onClick={(e) => { e.stopPropagation(); setDrawerLead(lead); }} className="px-2.5 py-1 rounded-lg bg-purple-50 text-xs font-medium text-purple-600 hover:bg-purple-100 transition-colors">View</button>
                            </Tooltip>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Lead" : "Add New Lead"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" />
            <Field label="Company" name="company" required />
            <Field label="Source" name="source">
              <select name="source" value={form.source} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
                <option value="">Select source</option>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Status" name="status" required>
              <select name="status" value={form.status} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.status ? "border-red-400" : "border-slate-200"}`}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
            </Field>
          </div>
          <Field label="Service Interest" name="service_interest" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 transition-colors disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update Lead" : "Add Lead"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
      <LeadDrawer lead={drawerLead} onClose={() => setDrawerLead(null)} onRefresh={load} />
    </div>
  );
}
