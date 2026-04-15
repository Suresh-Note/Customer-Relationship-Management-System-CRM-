import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip } from "../components/ui/Tooltip";
import Can from "../components/Can";
import axios from "../api/axios";

const TYPES = ["Call", "Email", "Meeting", "Note", "Task"];
const TABS  = ["All", ...TYPES];

const typeMeta = {
  Call:    { bg: "bg-blue-100",   text: "text-blue-600",   emoji: "📞" },
  Email:   { bg: "bg-amber-100",  text: "text-amber-600",  emoji: "📧" },
  Meeting: { bg: "bg-green-100",  text: "text-green-600",  emoji: "🤝" },
  Note:    { bg: "bg-violet-100", text: "text-violet-600", emoji: "📝" },
  Task:    { bg: "bg-rose-100",   text: "text-rose-600",   emoji: "✅" },
};

const INIT = { lead_id: "", type: "Call", notes: "" };

function validate(f) {
  const e = {};
  if (!f.type) e.type = "Type is required";
  return e;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export default function Activities() {
  const { onBellClick } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState("All");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(INIT);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [a, l] = await Promise.all([axios.get("/activities"), axios.get("/leads")]);
      setActivities(a.data);
      setLeads(l.data);
    } catch {
      showToast("Failed to load activities", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!location.state?.notificationTitle) return;

    if (location.state.notificationTab) {
      setTab(location.state.notificationTab);
    }

    setToast({ message: `${location.state.notificationTitle} opened`, type: "success" });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const openAdd  = () => { setEditItem(null); setForm(INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (a) => { setEditItem(a); setForm({ lead_id: a.lead_id || "", type: a.type || "Call", notes: a.notes || "" }); setErrors({}); setModalOpen(true); };

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
      const payload = { ...form, lead_id: form.lead_id || null };
      if (editItem) {
        await axios.put(`/activities/${editItem.activity_id}`, payload);
        showToast("Activity updated");
      } else {
        await axios.post("/activities", payload);
        showToast("Activity logged");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (!window.confirm("Delete this activity?")) return;
    setDeleting(a.activity_id);
    try {
      await axios.delete(`/activities/${a.activity_id}`);
      showToast("Activity deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = tab === "All" ? activities : activities.filter(a => a.type === tab);

  // Count by type for sidebar
  const typeCounts = TYPES.reduce((acc, t) => { acc[t] = activities.filter(a => a.type === t).length; return acc; }, {});

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Activities" onBellClick={onBellClick} rightContent={
        <Can roles={["Sales", "Developer", "Marketing", "Manager", "Admin"]}>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Log Activity
          </button>
        </Can>
      } />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6">
          {/* Left: Timeline */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-crm-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{t}</button>
              ))}
            </div>

            {loading ? (
              <div className="py-16 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-slate-400"><span className="text-4xl mb-3">🗂️</span><p className="text-sm">No activities found</p></div>
            ) : (
              <div className="space-y-3">
                {filtered.map(a => {
                  const meta = typeMeta[a.type] || typeMeta.Note;
                  const lead = leads.find(l => l.lead_id === a.lead_id);
                  return (
                    <div key={a.activity_id} className="flex gap-4 bg-white rounded-2xl border border-slate-100 shadow-card p-4 hover:shadow-md transition-shadow">
                      <Tooltip text={`Activity type: ${a.type}`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center text-lg cursor-default`}>{meta.emoji}</div>
                      </Tooltip>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{a.type}</span>
                            {lead && <Tooltip text={`Lead: ${lead.name} — ${lead.company || ""}`}><span className="text-xs text-slate-400 ml-2 cursor-default">— {lead.name}</span></Tooltip>}
                          </div>
                          <Tooltip text={a.activity_date ? new Date(a.activity_date).toLocaleString() : "No date"}>
                            <span className="flex-shrink-0 text-xs text-slate-400 cursor-default">{timeAgo(a.activity_date)}</span>
                          </Tooltip>
                        </div>
                        {a.notes && <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{a.notes}</p>}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Can roles={["Sales", "Developer", "Marketing", "Manager", "Admin"]}>
                          <Tooltip text="Edit this activity">
                            <button onClick={() => openEdit(a)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
                          </Tooltip>
                        </Can>
                        <Can roles={["Manager", "Admin"]}>
                          <Tooltip text="Delete this activity">
                            <button onClick={() => handleDelete(a)} disabled={deleting === a.activity_id} className="px-2.5 py-1 rounded-lg bg-red-50 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50">
                              {deleting === a.activity_id ? "…" : "Del"}
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

          {/* Right Sidebar */}
          <div className="w-56 flex-shrink-0 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Breakdown</h3>
              <div className="space-y-2">
                {TYPES.map(t => {
                  const meta = typeMeta[t];
                  const tipMap = {
                    Call: "Phone calls logged with leads or clients",
                    Email: "Emails sent or received",
                    Meeting: "In-person or virtual meetings",
                    Note: "Internal notes and observations",
                    Task: "Tasks tracked as activities",
                  };
                  return (
                    <Tooltip key={t} text={tipMap[t] || t}>
                      <div className="flex items-center justify-between w-full cursor-default">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg ${meta.bg} ${meta.text} flex items-center justify-center text-xs`}>{meta.emoji}</span>
                          <span className="text-xs text-slate-600 font-medium">{t}s</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{typeCounts[t]}</span>
                      </div>
                    </Tooltip>
                  );
                })}
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-xs font-bold text-slate-700">{activities.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Activity" : "Log Activity"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Type <span className="text-red-400">*</span></label>
            <select name="type" value={form.type} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.type ? "border-red-400" : "border-slate-200"}`}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Related Lead</label>
            <select name="lead_id" value={form.lead_id} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30">
              <option value="">None</option>
              {leads.map(l => <option key={l.lead_id} value={l.lead_id}>{l.name} — {l.company}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 resize-none" placeholder="Add details about this activity…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update" : "Log Activity"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
