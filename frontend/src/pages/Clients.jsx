import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip, ClientAvatarTip } from "../components/ui/Tooltip";
import Can from "../components/Can";
import axios from "../api/axios";

const STATUSES        = ["Active", "On hold", "Inactive"];
const FILTERS         = ["All", "Active", "On hold", "Inactive"];
const PRIORITY_FILTERS = ["All", "High", "Medium", "Low"];

const priorityMeta = {
  High:   { badge: "bg-red-100 text-red-700",     dot: "bg-red-400",    label: "High" },
  Medium: { badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-400",  label: "Medium" },
  Low:    { badge: "bg-slate-100 text-slate-500",  dot: "bg-slate-300",  label: "Low" },
};

function getPriority(amount) {
  const a = Number(amount || 0);
  if (a >= 1000000) return "High";
  if (a >= 500000)  return "Medium";
  return "Low";
}

const statusMeta = {
  Active:   { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400", tooltip: "This client has active projects or deals in progress" },
  "On hold": { badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-400",   tooltip: "Engagement paused — follow up to re-activate" },
  Inactive: { badge: "bg-slate-100 text-slate-500",    dot: "bg-slate-300",   tooltip: "No active engagement — consider a win-back campaign" },
};

const avatarColors = [
  "bg-blue-200 text-blue-800","bg-rose-200 text-rose-800","bg-emerald-200 text-emerald-800",
  "bg-amber-200 text-amber-800","bg-violet-200 text-violet-800","bg-teal-200 text-teal-800",
  "bg-indigo-200 text-indigo-800","bg-pink-200 text-pink-800","bg-cyan-200 text-cyan-800","bg-orange-200 text-orange-800",
];

const INIT = { company_name: "", contact_person: "", email: "", phone: "", status: "Active" };

function validate(f) {
  const e = {};
  if (!f.company_name.trim()) e.company_name = "Company name is required";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email";
  return e;
}

function getInitials(n) { return (n||"?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }


export default function Clients() {
  const { onBellClick } = useOutletContext();
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(INIT);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [sortKey, setSortKey]       = useState(null);
  const [sortDir, setSortDir]       = useState("asc");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const showToast = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/clients");
      setClients(data);
    } catch {
      showToast("Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditItem(null); setForm(INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (c) => {
    setEditItem(c);
    setForm({ company_name: c.company_name || "", contact_person: c.contact_person || "", email: c.email || "", phone: c.phone || "", status: c.status || "Active" });
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
      if (editItem) {
        await axios.put(`/clients/${editItem.client_id}`, form);
        showToast("Client updated");
      } else {
        await axios.post("/clients", form);
        showToast("Client added");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete client "${c.company_name}"? This will also remove linked deals and projects.`)) return;
    setDeleting(c.client_id);
    try {
      await axios.delete(`/clients/${c.client_id}`);
      showToast("Client deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const quickStatus = async (c, newStatus) => {
    try {
      await axios.put(`/clients/${c.client_id}`, {
        company_name: c.company_name,
        contact_person: c.contact_person,
        email: c.email,
        phone: c.phone,
        status: newStatus,
      });
      showToast(`${c.company_name} → ${newStatus}`);
      load();
    } catch {
      showToast("Update failed", "error");
    }
  };

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = clients
    .filter(c => {
      const statusMatch   = filter === "All" || c.status === filter;
      const searchMatch   = !search || `${c.company_name} ${c.contact_person} ${c.email}`.toLowerCase().includes(search.toLowerCase());
      const priorityMatch = priorityFilter === "All" || getPriority(c.total_amount) === priorityFilter;
      return statusMatch && searchMatch && priorityMatch;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const counts = FILTERS.reduce((acc, f) => { acc[f] = f === "All" ? clients.length : clients.filter(c => c.status === f).length; return acc; }, {});
  const priorityCounts = PRIORITY_FILTERS.reduce((acc, p) => { acc[p] = p === "All" ? clients.length : clients.filter(c => getPriority(c.total_amount) === p).length; return acc; }, {});
  const active = clients.filter(c => c.status === "Active").length;
  const onHold = clients.filter(c => c.status === "On hold").length;
  const inactive = clients.filter(c => c.status === "Inactive").length;

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Clients" onBellClick={onBellClick} rightContent={
        <Can roles={["Sales", "Manager", "Admin"]}>
          <Tooltip text="Add a new client company to your CRM">
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Client
            </button>
          </Tooltip>
        </Can>
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Tooltip text="Total number of client companies in your CRM">
            <div className="stat-card w-full">
              <p className="text-xs text-slate-400 font-medium mb-1">Total Clients</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "—" : clients.length}</p>
              <p className="text-xs mt-1 font-medium text-slate-400">All accounts</p>
            </div>
          </Tooltip>
          <Tooltip text="Clients with active projects or open deals — requires regular check-ins">
            <div className="stat-card w-full">
              <p className="text-xs text-slate-400 font-medium mb-1">Active</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "—" : active}</p>
              <p className={`text-xs mt-1 font-medium ${active > 0 ? "text-green-500" : "text-slate-400"}`}>
                {clients.length ? `${Math.round((active / clients.length) * 100)}% of portfolio` : "0% retention"}
              </p>
            </div>
          </Tooltip>
          <Tooltip text="Clients with paused engagement — follow up to reactivate">
            <div className="stat-card w-full">
              <p className="text-xs text-slate-400 font-medium mb-1">On Hold</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "—" : onHold}</p>
              <p className={`text-xs mt-1 font-medium ${onHold > 0 ? "text-amber-500" : "text-slate-400"}`}>{onHold > 0 ? "Needs attention" : "All good"}</p>
            </div>
          </Tooltip>
          <Tooltip text="Churned clients — consider win-back outreach">
            <div className="stat-card w-full">
              <p className="text-xs text-slate-400 font-medium mb-1">Inactive</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "—" : inactive}</p>
              <p className={`text-xs mt-1 font-medium ${inactive > 0 ? "text-red-500" : "text-slate-400"}`}>{inactive > 0 ? "Churned" : "None churned"}</p>
            </div>
          </Tooltip>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-white text-crm-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {f}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-crm-primary/10 text-crm-primary" : "bg-slate-200 text-slate-500"}`}>{counts[f]}</span>
              </button>
            ))}
          </div>
          {/* Priority filter */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {PRIORITY_FILTERS.map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${priorityFilter === p ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {p !== "All" && <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta[p]?.dot}`} />}
                <span className={priorityFilter === p ? (p === "High" ? "text-red-600" : p === "Medium" ? "text-amber-600" : p === "Low" ? "text-slate-500" : "text-crm-primary") : ""}>
                  {p}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${priorityFilter === p ? (p === "High" ? "bg-red-100 text-red-600" : p === "Medium" ? "bg-amber-100 text-amber-600" : p === "Low" ? "bg-slate-200 text-slate-500" : "bg-crm-primary/10 text-crm-primary") : "bg-slate-200 text-slate-500"}`}>
                  {priorityCounts[p]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-crm-primary/30 w-56" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading clients…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-slate-400">
              <span className="text-4xl mb-3">🏢</span>
              <p className="text-sm font-medium">{search || filter !== "All" ? "No clients match your filter" : "No clients yet — add your first one!"}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    { label: "Client",         key: "company_name" },
                    { label: "Contact Person", key: "contact_person" },
                    { label: "Email",          key: "email" },
                    { label: "Phone",          key: "phone" },
                    { label: "Status",         key: "status" },
                    { label: "Priority",       key: "total_amount" },
                  ].map(({ label, key }) => (
                    <th key={key} className="table-header cursor-pointer select-none" onClick={() => toggleSort(key)}>
                      <span className="inline-flex items-center gap-1">
                        {label === "Status" ? (
                          <Tooltip text="Client lifecycle stage: Active = engaged, On hold = paused, Inactive = churned">
                            <span className="flex items-center gap-1 cursor-pointer">
                              {label}
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </span>
                          </Tooltip>
                        ) : label}
                        <span className="inline-flex flex-col ml-0.5">
                          <svg className={`w-2.5 h-2.5 ${sortKey === key && sortDir === "asc" ? "text-crm-primary" : "text-slate-300"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                          <svg className={`w-2.5 h-2.5 ${sortKey === key && sortDir === "desc" ? "text-crm-primary" : "text-slate-300"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                        </span>
                      </span>
                    </th>
                  ))}
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c, i) => {
                  const meta = statusMeta[c.status] || statusMeta.Active;
                  const priority = getPriority(c.total_amount);
                  const pm = priorityMeta[priority];
                  return (
                    <tr key={c.client_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <ClientAvatarTip client={c} color={avatarColors[i % avatarColors.length]}>
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                              {getInitials(c.company_name)}
                            </span>
                          </ClientAvatarTip>
                          <span className="font-semibold text-slate-800">{c.company_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{c.contact_person || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{c.email || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{c.phone || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Tooltip text={meta.tooltip}>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-default ${meta.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {c.status || "Active"}
                          </span>
                        </Tooltip>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pm.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
                          {pm.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* Quick status change */}
                          <Can roles={["Sales", "Manager", "Admin"]}>
                            {STATUSES.filter(s => s !== c.status).map(s => (
                              <Tooltip key={s} text={`Mark as ${s}`}>
                                <button onClick={() => quickStatus(c, s)}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                    s === "Active"   ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" :
                                    s === "On hold"  ? "bg-amber-50 text-amber-600 hover:bg-amber-100" :
                                    "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  }`}>
                                  {s === "Active" ? "✓ Active" : s === "On hold" ? "⏸ Hold" : "✕ Inactive"}
                                </button>
                              </Tooltip>
                            ))}
                            <Tooltip text="Edit client details">
                              <button onClick={() => openEdit(c)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Edit
                              </button>
                            </Tooltip>
                          </Can>
                          <Can roles={["Manager", "Admin"]}>
                            <Tooltip text="Permanently delete this client and all linked records">
                              <button onClick={() => handleDelete(c)} disabled={deleting === c.client_id}
                                className="px-2.5 py-1 rounded-lg bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                                {deleting === c.client_id ? "…" : "Delete"}
                              </button>
                            </Tooltip>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Client" : "Add New Client"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name <span className="text-red-400">*</span></label>
              <input name="company_name" value={form.company_name} onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.company_name ? "border-red-400" : "border-slate-200"}`} />
              {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person</label>
              <input name="contact_person" value={form.contact_person} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.email ? "border-red-400" : "border-slate-200"}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status
                <Tooltip text="Active = current client, On hold = paused, Inactive = churned">
                  <svg className="inline w-3.5 h-3.5 text-slate-400 ml-1 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </Tooltip>
              </label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update Client" : "Add Client"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
