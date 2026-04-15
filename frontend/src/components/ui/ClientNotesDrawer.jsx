import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Toast from "./Toast";

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

const STATUS_COLORS = {
  Active:    "bg-emerald-100 text-emerald-700",
  "On hold": "bg-amber-100 text-amber-700",
  Inactive:  "bg-slate-100 text-slate-500",
};
const STATUS_DOT = {
  Active:    "bg-emerald-400",
  "On hold": "bg-amber-400",
  Inactive:  "bg-slate-300",
};

export default function ClientNotesDrawer({ client, onClose }) {
  const [notes, setNotes]         = useState([]);
  const [noteText, setNoteText]   = useState("");
  const [adding, setAdding]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    axios.get(`/clients/${client.client_id}/notes`)
      .then(r => setNotes(r.data))
      .catch(() => showToast("Failed to load notes", "error"))
      .finally(() => setLoading(false));
  }, [client]);

  if (!client) return null;

  const handleAdd = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await axios.post(`/clients/${client.client_id}/notes`, { note: noteText });
      const r = await axios.get(`/clients/${client.client_id}/notes`);
      setNotes(r.data);
      setNoteText("");
      setAdding(false);
      showToast("Note saved");
    } catch { showToast("Failed to save note", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (note_id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`/clients/${client.client_id}/notes/${note_id}`);
      setNotes(n => n.filter(x => x.note_id !== note_id));
      showToast("Note deleted");
    } catch { showToast("Failed to delete note", "error"); }
  };

  const initials = (client.company_name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const statusColor = STATUS_COLORS[client.status] || STATUS_COLORS.Active;
  const statusDot   = STATUS_DOT[client.status]    || STATUS_DOT.Active;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[460px] bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg">
                {initials}
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-tight">{client.company_name}</h2>
                <p className="text-indigo-100 text-sm">{client.contact_person || "—"}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{client.email || "—"}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status + phone */}
          <div className="flex items-center gap-3 mt-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              {client.status || "Active"}
            </span>
            {client.phone && (
              <span className="text-indigo-100 text-xs flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {client.phone}
              </span>
            )}
          </div>
        </div>

        {/* Notes section */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              📋 Client Notes
              <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {notes.length}
              </span>
            </h3>
            <button onClick={() => setAdding(v => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 transition-colors">
              {adding ? "✕ Cancel" : "+ Add Note"}
            </button>
          </div>

          {/* Add note form */}
          {adding && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3">
              <textarea
                autoFocus
                rows={4}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder={`e.g. Called ${client.contact_person || 'contact'} — interested in renewal. Follow up next Monday with pricing.`}
                className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none bg-white"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => { setAdding(false); setNoteText(""); }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg border border-slate-200 bg-white">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={saving || !noteText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                  {saving ? "Saving…" : "Save Note"}
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
              <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading notes…
            </div>
          ) : notes.length === 0 && !adding ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm font-medium text-slate-500">No notes yet</p>
              <p className="text-xs text-slate-400 mt-1">Track calls, follow-ups and client updates</p>
              <button onClick={() => setAdding(true)}
                className="mt-3 text-xs text-indigo-500 font-semibold hover:underline">
                Add first note →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map(n => (
                <div key={n.note_id}
                  className="bg-white border border-slate-100 rounded-2xl px-4 py-3 group hover:border-indigo-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-700 leading-relaxed flex-1">{n.note}</p>
                    <button onClick={() => handleDelete(n.note_id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all text-xs mt-0.5 p-1 rounded">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                      {(n.created_by || "Y")[0].toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {n.created_by || "You"} · {timeAgo(n.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}
