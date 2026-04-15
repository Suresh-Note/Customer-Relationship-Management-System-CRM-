import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { Tooltip, MemberAvatarTip } from "../components/ui/Tooltip";
import Can from "../components/Can";
import axios from "../api/axios";

const avatarColors = ["bg-amber-400","bg-emerald-400","bg-blue-400","bg-rose-400","bg-purple-400","bg-teal-400","bg-indigo-400"];

const INIT = { team_name: "", description: "" };

function validate(f) {
  const e = {};
  if (!f.team_name.trim()) e.team_name = "Team name is required";
  return e;
}

function getInitials(n) { return (n || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

export default function Team() {
  const { onBellClick } = useOutletContext();
  const [teams, setTeams]         = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
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
      const [t, u] = await Promise.all([axios.get("/teams"), axios.get("/users")]);
      setTeams(t.data);
      setUsers(u.data);
    } catch {
      showToast("Failed to load teams", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditItem(null); setForm(INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (t) => { setEditItem(t); setForm({ team_name: t.team_name || "", description: t.description || "" }); setErrors({}); setModalOpen(true); };

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
        await axios.put(`/teams/${editItem.team_id}`, form);
        showToast("Team updated");
      } else {
        await axios.post("/teams", form);
        showToast("Team created");
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
    if (!window.confirm(`Delete team "${t.team_name}"?`)) return;
    setDeleting(t.team_id);
    try {
      await axios.delete(`/teams/${t.team_id}`);
      showToast("Team deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = teams.filter(t =>
    !search || t.team_name.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const statMeta = [
    { label: "Total Teams",   value: teams.length, sub: "All departments",  c: "text-slate-400",   tip: "Total number of teams across all departments in your organisation" },
    { label: "Total Members", value: users.length, sub: "Registered users", c: "text-crm-primary", tip: "All registered users assigned to at least one team" },
    { label: "Avg Team Size", value: teams.length ? Math.round(users.length / teams.length) : 0, sub: "Members per team", c: "text-slate-400", tip: "Average number of members per team — helps gauge team balance" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Team" onBellClick={onBellClick} rightContent={
        <Can roles={["Manager", "Admin"]}>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-crm-primary text-white text-sm font-semibold rounded-xl hover:bg-crm-primary/90 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Team
          </button>
        </Can>
      } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statMeta.map(s => (
            <Tooltip key={s.label} text={s.tip} wide>
              <div className="stat-card w-full cursor-default">
                <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                  {s.label}
                  <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-8-3a1 1 0 0 0-.867.5 1 1 0 1 1-1.731-1A3 3 0 0 1 13 10a3.001 3.001 0 0 1-2 2.83V13a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1 1 1 0 1 0 0-2zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd"/>
                  </svg>
                </p>
                <p className="text-2xl font-bold text-slate-800">{loading ? "—" : s.value}</p>
                <p className={`text-xs mt-1 font-medium ${s.c}`}>{s.sub}</p>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams…" className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-crm-primary/30 w-full" />
        </div>

        {/* Team Cards + Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Teams column */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Teams ({filtered.length})</h2>
            {loading ? (
              <div className="py-10 flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-slate-400"><span className="text-3xl mb-2">👥</span><p className="text-sm">No teams yet</p></div>
            ) : (
              filtered.map((t, i) => {
                const members = users.filter(u => u.team_id === t.team_id);
                return (
                  <div key={t.team_id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Tooltip text={`${t.team_name} — ${members.length} member${members.length !== 1 ? "s" : ""}`}>
                          <div className={`w-10 h-10 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm cursor-default`}>
                            {getInitials(t.team_name)}
                          </div>
                        </Tooltip>
                        <div>
                          <h3 className="font-semibold text-slate-800">{t.team_name}</h3>
                          <Tooltip text={`${members.length} active member${members.length !== 1 ? "s" : ""} in this team`}>
                            <p className="text-xs text-slate-400 cursor-default">{members.length} member{members.length !== 1 ? "s" : ""}</p>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Can roles={["Manager", "Admin"]}>
                          <Tooltip text="Edit team name or description">
                            <button onClick={() => openEdit(t)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
                          </Tooltip>
                        </Can>
                        <Can roles={["Manager", "Admin"]}>
                          <Tooltip text="Permanently delete this team">
                            <button onClick={() => handleDelete(t)} disabled={deleting === t.team_id} className="px-2.5 py-1 rounded-lg bg-red-50 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50">
                              {deleting === t.team_id ? "…" : "Del"}
                            </button>
                          </Tooltip>
                        </Can>
                      </div>
                    </div>

                    {t.description && (
                      <Tooltip text={t.description} wide>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3 cursor-default line-clamp-2">{t.description}</p>
                      </Tooltip>
                    )}

                    {/* Member avatars */}
                    {members.length > 0 && (
                      <div className="flex -space-x-2 items-center">
                        {members.slice(0, 5).map((u, j) => (
                          <MemberAvatarTip key={u.user_id} user={u} team={t} color={avatarColors[j % avatarColors.length]} />
                        ))}
                        {members.length > 5 && (
                          <Tooltip text={members.slice(5).map(u => u.name).join(", ")} wide>
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold cursor-default">
                              +{members.length - 5}
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Members column */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Members ({users.length})</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card divide-y divide-slate-50 overflow-hidden">
              {users.length === 0 ? (
                <div className="py-10 flex flex-col items-center text-slate-400"><span className="text-3xl mb-2">👤</span><p className="text-sm">No users found</p></div>
              ) : (
                users.map((u, i) => {
                  const team = teams.find(t => t.team_id === u.team_id);
                  return (
                    <div key={u.user_id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                      <MemberAvatarTip user={u} team={team} color={avatarColors[i % avatarColors.length]} size="w-9 h-9" textSize="text-xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                        <Tooltip text={`Email: ${u.email}`}>
                          <p className="text-xs text-slate-400 truncate cursor-default">{u.email}</p>
                        </Tooltip>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Tooltip text={`Role: ${u.role || "Member"}`}>
                          <p className="text-xs font-medium text-slate-600 capitalize cursor-default">{u.role}</p>
                        </Tooltip>
                        {team && (
                          <Tooltip text={team.description || `Part of ${team.team_name}`} wide>
                            <p className="text-xs text-slate-400 cursor-default">{team.team_name}</p>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Team" : "New Team"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Team Name <span className="text-red-400">*</span></label>
            <input name="team_name" value={form.team_name} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 ${errors.team_name ? "border-red-400" : "border-slate-200"}`} />
            {errors.team_name && <p className="text-xs text-red-500 mt-1">{errors.team_name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-primary/30 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 disabled:opacity-60">
              {saving ? "Saving…" : editItem ? "Update Team" : "Create Team"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
