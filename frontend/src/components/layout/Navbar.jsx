import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEY = "crm_profile_overrides";

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function loadOverrides(user) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If stored data belongs to a DIFFERENT user — discard it
      if (parsed._uid && parsed._uid !== user?.email) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        return parsed;
      }
    }
  } catch {}
  // Fresh defaults for this user
  return {
    _uid:     user?.email || "",
    name:     user?.name  || "",
    email:    user?.email || "",
    phone:    user?.contact_number || "",
    location: user?.country_name   || "",
  };
}

function ProfileDropdown({ user, onSignOut }) {
  const [profile, setProfile] = useState(() => loadOverrides(user));
  const [editing, setEditing]  = useState(false);
  const [draft,   setDraft]    = useState(profile);

  // When a new user logs in, reset profile to their actual data
  useEffect(() => {
    if (!user?.email) return;
    const fresh = loadOverrides(user);
    setProfile(fresh);
    setDraft(fresh);
  }, [user?.email]);

  function openEdit() {
    setDraft({ ...profile });
    setEditing(true);
  }

  function save() {
    const toSave = { ...draft, _uid: user?.email || "" };
    setProfile(toSave);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); } catch {}
    setEditing(false);
  }

  const role     = user?.role || "Account Manager";
  const initials = getInitials(profile.name);

  if (editing) return (
    <div className="w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-5">
      <p className="text-sm font-bold text-slate-800 mb-4">Edit Profile</p>
      <div className="space-y-3">
        {[["Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Location","location","text"]].map(([lbl, key, type]) => (
          <div key={key}>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">{lbl}</label>
            <input
              type={type}
              value={draft[key] || ""}
              onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crm-primary/40 focus:border-crm-primary bg-slate-50"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={save}                    className="flex-1 py-2 rounded-lg bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 transition-colors">Save</button>
        <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-amber-200 flex items-center justify-center text-sm font-bold text-amber-800 flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">{profile.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{role}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2.5">
        {[
          { d: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>, v: profile.email },
          { d: <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>, v: profile.phone },
          { d: <><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></>, v: profile.location },
        ].map(({ d, v }, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">{d}</svg>
            <span className="text-xs text-slate-600 truncate">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={openEdit}
          className="flex-1 py-2 rounded-lg text-crm-primary text-sm font-semibold border border-crm-primary/20 hover:bg-crm-primary/5 transition-colors">
          Edit Profile
        </button>
        <button onClick={onSignOut}
          className="flex-1 py-2 rounded-lg text-red-500 text-sm font-semibold border border-red-200 hover:bg-red-50 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Navbar({ title, onBellClick, rightContent }) {
  const { user, logout } = useAuth();
  const [open, setOpen]  = useState(false);
  const ref              = useRef(null);

  useEffect(() => {
    if (!open) return;
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Avatar initials: use saved name if available, else auth user
  const savedName = (() => {
    try { const r = sessionStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r).name : null; } catch { return null; }
  })();
  const initials = getInitials(savedName || user?.name || "");

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-transparent relative">
      <h1 className="text-xl font-extrabold text-crm-heading">{title}</h1>

      <div className="flex items-center gap-3">
        {rightContent}

        {/* Bell */}
        <button onClick={onBellClick} className="relative p-2 rounded-xl hover:bg-white/70 transition-colors" title="Notifications">
          <svg className="w-5 h-5 text-crm-copy-soft" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crm-danger rounded-full" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen(v => !v)}
            className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800 hover:ring-2 hover:ring-amber-300 transition-all select-none">
            {initials}
          </button>
          {open && (
            <div className="absolute right-0 top-12 z-50">
              <ProfileDropdown user={user} onSignOut={() => { setOpen(false); sessionStorage.removeItem(STORAGE_KEY); logout(); }} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
