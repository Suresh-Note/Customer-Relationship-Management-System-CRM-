import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip } from "../components/ui/Tooltip";
import Can from "../components/Can";
import axios from "../api/axios";

const STATUSES = ["Pending", "Paid", "Overdue"];
const FILTERS  = ["All", "Paid", "Pending", "Overdue"];

const statusMeta = {
  Paid:    { badge: "bg-green-50 text-green-700 ring-green-200",   dot: "bg-green-400" },
  Pending: { badge: "bg-amber-50 text-amber-700 ring-amber-200",   dot: "bg-amber-400" },
  Overdue: { badge: "bg-red-50 text-red-600 ring-red-200",         dot: "bg-red-400" },
};

const INIT = { project_id: "", amount: "", status: "Pending", issued_date: "", due_date: "" };

function validate(f) {
  const e = {};
  if (!f.amount || isNaN(f.amount) || Number(f.amount) <= 0) e.amount = "Enter a valid amount";
  if (!f.status) e.status = "Status is required";
  return e;
}

function formatLakhs(v) {
  const n = Number(v || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function Invoices() {
  const { onBellClick } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoices, setInvoices]   = useState([]);
  const [projects, setProjects]   = useState([]);
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

  const showToast = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [inv, proj] = await Promise.all([axios.get("/invoices"), axios.get("/projects")]);
      setInvoices(inv.data);
      setProjects(proj.data);
    } catch {
      showToast("Failed to load invoices", "error");
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
  const openEdit = (inv) => {
    setEditItem(inv);
    setForm({ project_id: inv.project_id || "", amount: inv.amount || "", status: inv.status || "Pending", issued_date: inv.issued_date ? inv.issued_date.slice(0, 10) : "", due_date: inv.due_date ? inv.due_date.slice(0, 10) : "" });
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
      const payload = { ...form, amount: Number(form.amount), project_id: form.project_id || null };
      if (editItem) {
        await axios.put(`/invoices/${editItem.invoice_id}`, payload);
        showToast("Invoice updated");
      } else {
        await axios.post("/invoices", payload);
        showToast("Invoice created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm("Delete this invoice?")) return;
    setDeleting(inv.invoice_id);
    try {
      await axios.delete(`/invoices/${inv.invoice_id}`);
      showToast("Invoice deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = invoices.filter(inv => {
    const statusMatch = filter === "All" || inv.status === filter;
    const proj = projects.find(p => p.project_id === inv.project_id);
    const invoiceLabel = `INV-${String(inv.invoice_id).padStart(3, "0")}`;
    const searchMatch =
      !search ||
      (proj?.project_name || "").toLowerCase().includes(search.toLowerCase()) ||
      String(inv.invoice_id).includes(search) ||
      invoiceLabel.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const total     = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
  const collected = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.amount || 0), 0);
  const pending   = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + Number(i.amount || 0), 0);
  const overdue   = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + Number(i.amount || 0), 0);
  const collectedPct = total ? Math.round((collected / total) * 100) : 0;
  const pendingPct   = total ? Math.round((pending  / total) * 100) : 0;
  const overduePct   = total ? Math.round((overdue  / total) * 100) : 0;

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
      <Navbar title="Invoices" onBellClick={onBellClick} rightContent={
        <Can roles={["Manager", "Admin"]}>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Invoice
          </button>
        </Can>
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Invoiced", value: formatLakhs(total), sub: `${invoices.length} invoices`, c: "text-slate-400", tip: "Total amount billed across all invoices" },
            { label: "Collected", value: formatLakhs(collected), sub: `${collectedPct}% collected`, c: "text-green-500", tip: "Amount already received from paid invoices" },
            { label: "Pending", value: formatLakhs(pending), sub: `${pendingPct}% pending`, c: "text-amber-500", tip: "Amount awaiting payment on pending invoices" },
            { label: "Overdue", value: formatLakhs(overdue), sub: `${overduePct}% overdue`, c: "text-red-500", tip: "Amount past due date — needs urgent follow-up" },
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

        {/* Progress bar */}
        {total > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-700">Collection Progress</h3>
              <span className="text-xs text-slate-400">{collectedPct}% collected</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
              <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${collectedPct}%` }} />
              <div className="h-full bg-amber-300" style={{ width: `${pendingPct}%` }} />
              <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${overduePct}%` }} />
            </div>
            <div className="flex gap-5 mt-3">
              {[
                { color: "bg-green-400", label: "Collected", val: formatLakhs(collected), tip: `${collectedPct}% of total — payments received` },
                { color: "bg-amber-300", label: "Pending",   val: formatLakhs(pending),   tip: `${pendingPct}% of total — awaiting payment` },
                { color: "bg-red-400",   label: "Overdue",   val: formatLakhs(overdue),   tip: `${overduePct}% of total — past due, follow up required` },
              ].map(l => (
                <Tooltip key={l.label} text={l.tip} wide>
                  <div className="flex items-center gap-1.5 cursor-default">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                    <span className="text-xs text-slate-500">{l.label}</span>
                    <span className="text-xs font-semibold text-slate-700">{l.val}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-white text-crm-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{f}</button>
            ))}
          </div>
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…" className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-crm-primary/30 w-56" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-slate-400"><span className="text-4xl mb-3">🧾</span><p className="text-sm">No invoices found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["ID", "Project", "Amount", "Status", "Issued", "Due", "Actions"].map(h => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(inv => {
                  const meta = statusMeta[inv.status] || statusMeta.Pending;
                  const proj = projects.find(p => p.project_id === inv.project_id);
                  return (
                    <tr key={inv.invoice_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-crm-primary bg-crm-primary/5 px-2 py-1 rounded-lg">
                          #{inv.invoice_id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{proj?.project_name || "—"}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">{formatLakhs(inv.amount)}</td>
                      <td className="px-5 py-3.5">
                        <Tooltip text={inv.status === "Paid" ? "Payment received — invoice settled" : inv.status === "Pending" ? "Awaiting payment from client" : "Past due date — follow up needed"}>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 flex items-center gap-1 w-fit cursor-default ${meta.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{inv.status}
                          </span>
                        </Tooltip>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{inv.issued_date ? inv.issued_date.slice(0, 10) : "—"}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        <Tooltip text={inv.due_date ? `Payment due by ${inv.due_date.slice(0, 10)}` : "No due date set"}>
                          <span className="cursor-default">{inv.due_date ? inv.due_date.slice(0, 10) : "—"}</span>
                        </Tooltip>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <Can roles={["Manager", "Admin"]}>
                            <Tooltip text="Edit invoice details">
                              <button onClick={() => openEdit(inv)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
                            </Tooltip>
                          </Can>
                          <Can roles={["Manager", "Admin"]}>
                            <Tooltip text="Permanently delete this invoice">
                              <button onClick={() => handleDelete(inv)} disabled={deleting === inv.invoice_id} className="px-2.5 py-1 rounded-lg bg-red-50 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50">
                                {deleting === inv.invoice_id ? "…" : "Delete"}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Invoice" : "New Invoice"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Project" name="project_id">
            <select name="project_id" value={form.project_id} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
              <option value="">None</option>
              {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
            </select>
          </Field>
          <Field label="Amount (₹)" name="amount" type="number" required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Issued Date" name="issued_date" type="date" />
            <Field label="Due Date" name="due_date" type="date" />
            <div className="col-span-2">
              <Field label="Status" name="status" required>
                <select name="status" value={form.status} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.status ? "border-red-400" : "border-slate-200"}`}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update" : "Create Invoice"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
