import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip } from "../components/ui/Tooltip";
import Can from "../components/Can";
import axios from "../api/axios";

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES   = ["Pending", "In Progress", "Done"];

const priorityMeta = {
  High:   { badge: "bg-red-50 text-red-600 ring-red-200" },
  Medium: { badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  Low:    { badge: "bg-slate-50 text-slate-500 ring-slate-200" },
};

const statusMeta = {
  Pending:     "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Done:        "bg-green-100 text-green-700",
};

const INIT = { task_name: "", project_id: "", assigned_to: "", deadline: "", status: "Pending", priority: "Medium", description: "" };

function validate(f) {
  const e = {};
  if (!f.task_name.trim()) e.task_name = "Task name is required";
  if (!f.status)           e.status    = "Status is required";
  if (!f.priority)         e.priority  = "Priority is required";
  return e;
}

export default function Tasks() {
  const { onBellClick } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
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
      const [t, p, u] = await Promise.all([axios.get("/tasks"), axios.get("/projects"), axios.get("/users")]);
      setTasks(t.data);
      setProjects(p.data);
      setUsers(u.data);
    } catch {
      showToast("Failed to load tasks", "error");
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
  const openEdit = (t) => {
    setEditItem(t);
    setForm({ task_name: t.task_name || "", project_id: t.project_id || "", assigned_to: t.assigned_to || "", deadline: t.deadline ? t.deadline.slice(0, 10) : "", status: t.status || "Pending", priority: t.priority || "Medium", description: t.description || "" });
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
      const payload = { ...form, project_id: form.project_id || null, assigned_to: form.assigned_to || null };
      if (editItem) {
        await axios.put(`/tasks/${editItem.task_id}`, payload);
        showToast("Task updated");
      } else {
        await axios.post("/tasks", payload);
        showToast("Task created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete task "${t.task_name}"?`)) return;
    setDeleting(t.task_id);
    try {
      await axios.delete(`/tasks/${t.task_id}`);
      showToast("Task deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = tasks.filter(t => {
    const sMatch = filterStatus   === "All" || t.status   === filterStatus;
    const pMatch = filterPriority === "All" || t.priority === filterPriority;
    const qMatch = !search || t.task_name.toLowerCase().includes(search.toLowerCase());
    return sMatch && pMatch && qMatch;
  });

  const Field = ({ label, name, type = "text", required, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children || <input name={name} type={type} value={form[name]} onChange={handleChange}
        className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors[name] ? "border-red-400" : "border-slate-200"}`} />}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  const done  = tasks.filter(t => t.status === "Done").length;
  const inProg = tasks.filter(t => t.status === "In Progress").length;

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Tasks" onBellClick={onBellClick} rightContent={
        <Can roles={["Sales", "Developer", "Marketing", "Manager", "Admin"]}>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Task
          </button>
        </Can>
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Tasks", value: tasks.length, sub: "All tasks", c: "text-slate-400", tip: "Total number of tasks across all statuses and priorities" },
            { label: "In Progress", value: inProg, sub: "Active work", c: "text-blue-500", tip: "Tasks currently being worked on — need attention" },
            { label: "Completed", value: done, sub: `${tasks.length ? Math.round((done/tasks.length)*100) : 0}% done`, c: "text-green-500", tip: "Tasks marked Done — completion rate shown as percentage" },
            { label: "Pending", value: tasks.filter(t => t.status === "Pending").length, sub: "Not started", c: "text-slate-400", tip: "Tasks not yet started — waiting to be picked up" },
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
            {["All", ...STATUSES].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === f ? "bg-white text-crm-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{f}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {["All", ...PRIORITIES].map(f => (
              <button key={f} onClick={() => setFilterPriority(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterPriority === f ? "bg-white text-crm-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{f}</button>
            ))}
          </div>
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-crm-primary/30 w-56" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading tasks…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-slate-400"><span className="text-4xl mb-3">✅</span><p className="text-sm">No tasks found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Task", "Assigned To", "Deadline", "Status", "Priority", "Actions"].map(h => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(t => (
                  <tr key={t.task_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{t.task_name}</div>
                      {t.description && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{t.description}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{t.assigned_to_name || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{t.deadline ? t.deadline.slice(0, 10) : "—"}</td>
                    <td className="px-5 py-3.5">
                      <Tooltip text={t.status === "Pending" ? "Not started yet — waiting to be picked up" : t.status === "In Progress" ? "Currently being worked on" : "Task is complete"}>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-default ${statusMeta[t.status] || "bg-slate-100 text-slate-600"}`}>{t.status}</span>
                      </Tooltip>
                    </td>
                    <td className="px-5 py-3.5">
                      <Tooltip text={t.priority === "High" ? "High priority — address urgently" : t.priority === "Medium" ? "Medium priority — normal importance" : "Low priority — do when time permits"}>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ring-1 cursor-default ${(priorityMeta[t.priority] || priorityMeta.Low).badge}`}>{t.priority}</span>
                      </Tooltip>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <Can roles={["Sales", "Developer", "Marketing", "Manager", "Admin"]}>
                          <Tooltip text="Edit this task">
                            <button onClick={() => openEdit(t)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
                          </Tooltip>
                        </Can>
                        <Can roles={["Manager", "Admin"]}>
                          <Tooltip text="Permanently delete this task">
                            <button onClick={() => handleDelete(t)} disabled={deleting === t.task_id} className="px-2.5 py-1 rounded-lg bg-red-50 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50">
                              {deleting === t.task_id ? "…" : "Delete"}
                            </button>
                          </Tooltip>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Task" : "New Task"} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Task Name" name="task_name" required />
          <Field label="Description" name="description">
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Assigned To" name="assigned_to">
              <select name="assigned_to" value={form.assigned_to} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Project" name="project_id">
              <select name="project_id" value={form.project_id} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
                <option value="">None</option>
                {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
              </select>
            </Field>
            <Field label="Deadline" name="deadline" type="date" />
            <Field label="Priority" name="priority" required>
              <select name="priority" value={form.priority} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.priority ? "border-red-400" : "border-slate-200"}`}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
              {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority}</p>}
            </Field>
            <Field label="Status" name="status" required>
              <select name="status" value={form.status} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.status ? "border-red-400" : "border-slate-200"}`}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
