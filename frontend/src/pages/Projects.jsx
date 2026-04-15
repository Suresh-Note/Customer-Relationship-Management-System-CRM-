import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip, ProjectHandlerTip } from "../components/ui/Tooltip";
import Can from "../components/Can";
import axios from "../api/axios";

const STATUSES = ["Planning", "Active", "On Hold", "Completed"];
const FILTERS  = ["All", "Active", "Planning", "On Hold", "Completed"];

const statusMeta = {
  Active:    { dot: "bg-green-400",  badge: "bg-green-50 text-green-700 ring-green-200" },
  Planning:  { dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 ring-blue-200" },
  "On Hold": { dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  Completed: { dot: "bg-slate-400",  badge: "bg-slate-50 text-slate-600 ring-slate-200" },
};

const INIT = { project_name: "", service_type: "", client_id: "", start_date: "", end_date: "", status: "Planning", handlers: [] };

const HANDLER_ROLE_SUGGESTIONS = ["Frontend", "Backend", "ML / AI", "Design", "QA", "DevOps", "PM", "Mobile"];

function validate(f) {
  const e = {};
  if (!f.project_name.trim()) e.project_name = "Project name is required";
  if (!f.status)              e.status = "Status is required";
  return e;
}

export default function Projects() {
  const { onBellClick } = useOutletContext();
  const [projects, setProjects]   = useState([]);
  const [clients, setClients]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [detailItem, setDetailItem]       = useState(null);
  const [detailTasks, setDetailTasks]     = useState([]);
  const [detailInvoices, setDetailInvoices] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!detailItem) { setDetailTasks([]); setDetailInvoices([]); return; }
    let cancel = false;
    setDetailLoading(true);
    Promise.all([
      axios.get(`/tasks?project_id=${detailItem.project_id}`).catch(() => ({ data: [] })),
      axios.get(`/invoices?project_id=${detailItem.project_id}`).catch(() => ({ data: [] })),
    ]).then(([t, i]) => {
      if (cancel) return;
      setDetailTasks(t.data || []);
      setDetailInvoices(i.data || []);
    }).finally(() => { if (!cancel) setDetailLoading(false); });
    return () => { cancel = true; };
  }, [detailItem]);
  const [form, setForm]           = useState(INIT);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [p, c, u] = await Promise.all([
        axios.get("/projects"),
        axios.get("/clients"),
        axios.get("/users").catch(() => ({ data: [] })),
      ]);
      setProjects(p.data);
      setClients(c.data);
      setUsers(u.data || []);
    } catch {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditItem(null); setForm(INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      project_name: p.project_name || "",
      service_type: p.service_type || "",
      client_id:    p.client_id || "",
      start_date:   p.start_date ? p.start_date.slice(0, 10) : "",
      end_date:     p.end_date ? p.end_date.slice(0, 10) : "",
      status:       p.status || "Planning",
      handlers:     (p.handlers || []).map(h => ({ user_id: h.user_id, role: h.role })),
    });
    setErrors({});
    setModalOpen(true);
  };

  const addHandler    = () => setForm(f => ({ ...f, handlers: [...f.handlers, { user_id: "", role: "" }] }));
  const removeHandler = (idx) => setForm(f => ({ ...f, handlers: f.handlers.filter((_, i) => i !== idx) }));
  const updateHandler = (idx, field, value) =>
    setForm(f => ({ ...f, handlers: f.handlers.map((h, i) => i === idx ? { ...h, [field]: value } : h) }));

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
      const payload = {
        ...form,
        client_id: form.client_id || null,
        handlers: form.handlers
          .filter(h => h.user_id && h.role && h.role.trim())
          .map(h => ({ user_id: Number(h.user_id), role: h.role.trim() })),
      };
      if (editItem) {
        await axios.put(`/projects/${editItem.project_id}`, payload);
        showToast("Project updated");
      } else {
        await axios.post("/projects", payload);
        showToast("Project created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete project "${p.project_name}"?`)) return;
    setDeleting(p.project_id);
    try {
      await axios.delete(`/projects/${p.project_id}`);
      showToast("Project deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = projects.filter(p => {
    const statusMatch = filter === "All" || p.status === filter;
    const searchMatch = !search || `${p.project_name} ${p.service_type}`.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

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
      <Navbar title="Projects" onBellClick={onBellClick} rightContent={
        <Can roles={["Developer", "Manager", "Admin"]}>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Project
          </button>
        </Can>
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: projects.length, sub: "All projects", c: "text-slate-400", tip: "Total number of projects across all statuses" },
            { label: "Active", value: projects.filter(p => p.status === "Active").length, sub: "In progress", c: "text-green-500", tip: "Projects currently being executed and actively worked on" },
            { label: "Planning", value: projects.filter(p => p.status === "Planning").length, sub: "Not started", c: "text-blue-500", tip: "Projects in scoping or planning phase — work not yet started" },
            { label: "On Hold", value: projects.filter(p => p.status === "On Hold").length, sub: "Paused", c: "text-amber-500", tip: "Projects temporarily paused, awaiting client or internal decision" },
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-white text-crm-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-crm-primary/30 w-56" />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="py-20 flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-slate-400"><span className="text-4xl mb-3">📁</span><p className="text-sm">No projects found</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p, i) => {
              const meta = statusMeta[p.status] || statusMeta.Planning;
              const client = clients.find(c => c.client_id === p.client_id);
              return (
                <div
                  key={p.project_id}
                  onClick={() => setDetailItem(p)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-md hover:border-crm-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{p.project_name}</h3>
                      <ProjectHandlerTip project={p} client={client}>
                        <p className="text-xs text-slate-400 mt-0.5">{client?.company_name || p.service_type || "—"}</p>
                      </ProjectHandlerTip>
                    </div>
                    <Tooltip text={p.status === "Active" ? "Actively in progress" : p.status === "Planning" ? "In scoping/planning, not started" : p.status === "On Hold" ? "Paused — awaiting action" : "Successfully delivered"}>
                      <span className={`ml-3 flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 flex items-center gap-1 cursor-default ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{p.status}
                      </span>
                    </Tooltip>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    {p.start_date && <span>Start: {p.start_date.slice(0, 10)}</span>}
                    {p.end_date && <span>End: {p.end_date.slice(0, 10)}</span>}
                  </div>
                  {p.handlers && p.handlers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1.5">Handlers</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.handlers.map(h => (
                          <span key={`${h.user_id}-${h.role}`} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            <span className="font-semibold">{h.role}:</span>
                            <span className="text-slate-600">{h.user_name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <Can roles={["Developer", "Manager", "Admin"]}>
                      <Tooltip text="Edit project details">
                        <button onClick={() => openEdit(p)} className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                      </Tooltip>
                    </Can>
                    <Can roles={["Manager", "Admin"]}>
                      <Tooltip text="Permanently delete this project">
                        <button onClick={() => handleDelete(p)} disabled={deleting === p.project_id} className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
                          {deleting === p.project_id ? "…" : "Delete"}
                        </button>
                      </Tooltip>
                    </Can>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Project" : "New Project"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Project Name" name="project_name" required />
          <Field label="Service Type" name="service_type" />
          <Field label="Client" name="client_id">
            <select name="client_id" value={form.client_id} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
              <option value="">None</option>
              {clients.map(c => <option key={c.client_id} value={c.client_id}>{c.company_name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" name="start_date" type="date" />
            <Field label="End Date" name="end_date" type="date" />
            <Field label="Status" name="status" required>
              <select name="status" value={form.status} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.status ? "border-red-400" : "border-slate-200"}`}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
            </Field>
          </div>
          {/* Project Handlers (multiple) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">Project Handlers</label>
              <button type="button" onClick={addHandler} className="text-xs font-semibold text-crm-primary hover:underline">+ Add handler</button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Assign one person per area (e.g. Frontend, Backend, ML).</p>
            {form.handlers.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No handlers yet — click “Add handler”.</p>
            ) : (
              <div className="space-y-2">
                {form.handlers.map((h, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <input
                      list="handler-role-suggestions"
                      placeholder="Role (e.g. Frontend)"
                      value={h.role}
                      onChange={(e) => updateHandler(idx, "role", e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30"
                    />
                    <select
                      value={h.user_id}
                      onChange={(e) => updateHandler(idx, "user_id", e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30"
                    >
                      <option value="">Select user…</option>
                      {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removeHandler(idx)} className="px-2 py-2 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Remove">✕</button>
                  </div>
                ))}
              </div>
            )}
            <datalist id="handler-role-suggestions">
              {HANDLER_ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
            </datalist>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update" : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="Project Details" maxWidth="max-w-xl">
        {detailItem && (() => {
          const client = clients.find(c => c.client_id === detailItem.client_id);
          const meta = statusMeta[detailItem.status] || statusMeta.Planning;
          return (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{detailItem.project_name}</h3>
                  {detailItem.service_type && <p className="text-xs text-slate-500 mt-0.5">{detailItem.service_type}</p>}
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 flex items-center gap-1 ${meta.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{detailItem.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1">Client</p>
                  <p className="text-slate-700">{client?.company_name || "—"}</p>
                  {client?.contact_person && <p className="text-xs text-slate-500 mt-0.5">{client.contact_person}</p>}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1">Service Type</p>
                  <p className="text-slate-700">{detailItem.service_type || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1">Start Date</p>
                  <p className="text-slate-700">{detailItem.start_date ? detailItem.start_date.slice(0, 10) : "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1">End Date</p>
                  <p className="text-slate-700">{detailItem.end_date ? detailItem.end_date.slice(0, 10) : "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
                  Project Handlers {detailItem.handlers?.length ? `(${detailItem.handlers.length})` : ""}
                </p>
                {detailItem.handlers && detailItem.handlers.length > 0 ? (
                  <div className="space-y-2">
                    {detailItem.handlers.map(h => (
                      <div key={`${h.user_id}-${h.role}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                        <div className="w-9 h-9 rounded-full bg-crm-primary/10 text-crm-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(h.user_name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{h.user_name}</p>
                          {h.email && <p className="text-[11px] text-slate-500 truncate">{h.email}</p>}
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 flex-shrink-0">{h.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">No handlers assigned yet.</p>
                )}
              </div>

              {/* Related Tasks */}
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
                  Tasks {detailTasks.length ? `(${detailTasks.length})` : ""}
                </p>
                {detailLoading ? (
                  <p className="text-xs text-slate-400">Loading…</p>
                ) : detailTasks.length === 0 ? (
                  <p className="text-xs italic text-slate-400">No tasks for this project.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {detailTasks.map(t => (
                      <div key={t.task_id} className="flex items-center justify-between gap-3 text-xs p-2 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700 truncate">{t.task_name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {t.assigned_to_name && <span className="text-slate-500">{t.assigned_to_name}</span>}
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Invoices */}
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
                  Invoices {detailInvoices.length ? `(${detailInvoices.length})` : ""}
                </p>
                {detailLoading ? (
                  <p className="text-xs text-slate-400">Loading…</p>
                ) : detailInvoices.length === 0 ? (
                  <p className="text-xs italic text-slate-400">No invoices for this project.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {detailInvoices.map(i => (
                      <div key={i.invoice_id} className="flex items-center justify-between gap-3 text-xs p-2 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">#{i.invoice_id}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-slate-700 font-semibold">₹{Number(i.amount).toLocaleString("en-IN")}</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{i.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setDetailItem(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
                <Can roles={["Developer", "Manager", "Admin"]}>
                  <button onClick={() => { const p = detailItem; setDetailItem(null); openEdit(p); }} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90">Edit</button>
                </Can>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
