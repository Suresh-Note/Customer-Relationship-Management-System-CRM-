/**
 * Portal-based tooltip — renders at <body> level so it's never clipped.
 * File: frontend/src/components/ui/Tooltip.jsx
 */
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// ─── Simple text tooltip ────────────────────────────────────────────────────

export function Tooltip({ text, children, wide = false }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX, bottom: window.innerHeight - r.top - window.scrollY });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>
      {pos && createPortal(
        <div
          style={{ position: "absolute", top: pos.top - 8, left: pos.left, transform: "translate(-50%, -100%)", zIndex: 9999 }}
          className="pointer-events-none"
        >
          <div className={`bg-white border border-slate-200 shadow-xl rounded-xl px-3 py-2 text-[11px] font-medium text-slate-800 leading-snug ${wide ? "max-w-[240px] whitespace-normal text-center" : "whitespace-nowrap"}`}>
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-200" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-[4px] border-transparent border-t-white" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Rich member avatar tooltip ─────────────────────────────────────────────

export function MemberAvatarTip({ user, team, color, size = "w-7 h-7", textSize = "text-[10px]" }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <div ref={ref} className="inline-flex cursor-default" onMouseEnter={show} onMouseLeave={hide}>
        <div className={`${size} rounded-full border-2 border-white ${color} flex items-center justify-center ${textSize} text-white font-bold`}>
          {getInitials(user.name)}
        </div>
      </div>

      {pos && createPortal(
        <div
          style={{ position: "absolute", top: pos.top - 8, left: pos.left, transform: "translate(-50%, -100%)", zIndex: 9999 }}
          className="pointer-events-none"
        >
          <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 min-w-[200px]">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs text-white font-bold flex-shrink-0`}>
                {getInitials(user.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-500 capitalize leading-tight">{user.role || "Member"}</p>
              </div>
            </div>
            {/* Details */}
            <div className="border-t border-slate-100 pt-2 space-y-1.5">
              {/* Phone */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className="text-[11px] text-slate-600">{user.contact_number || "—"}</span>
              </div>
              {/* Email */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="text-[11px] text-slate-600">{user.email}</span>
              </div>
              {/* Gender */}
              {user.gender && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span className="text-[11px] text-slate-600 capitalize">{user.gender}</span>
                </div>
              )}
              {/* Team */}
              {team && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-[11px] text-slate-600">{team.team_name}</span>
                </div>
              )}
              {/* Joined */}
              {user.created_at && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-[11px] text-slate-400">
                    Joined {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-200" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-[4px] border-transparent border-t-white" />
        </div>,
        document.body
      )}
    </>
  );
}

function getInitials(n) { return (n || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

// ─── Project handler tooltip ──────────────────────────────────────────────────

const PROJECT_AVATAR_COLORS = [
  "bg-blue-200 text-blue-800","bg-rose-200 text-rose-800","bg-emerald-200 text-emerald-800",
  "bg-violet-200 text-violet-800","bg-amber-200 text-amber-800","bg-teal-200 text-teal-800",
];

const PROJECT_STATUS_CLS = {
  Active:    "bg-green-100 text-green-700",
  Planning:  "bg-blue-100 text-blue-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Completed: "bg-slate-100 text-slate-500",
};

export function ProjectHandlerTip({ project, client, children }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  if (!client) return <>{children}</>;

  const name      = client.contact_person;
  const idx       = (client.company_name || "A").toUpperCase().charCodeAt(0);
  const color     = PROJECT_AVATAR_COLORS[idx % PROJECT_AVATAR_COLORS.length];
  const startStr  = project.start_date ? new Date(project.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
  const endStr    = project.end_date   ? new Date(project.end_date).toLocaleDateString("en-IN",   { day: "numeric", month: "short", year: "numeric" }) : null;
  const statusCls = PROJECT_STATUS_CLS[project.status] || "bg-slate-100 text-slate-500";

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        className="inline-flex items-center gap-1.5 cursor-pointer group"
      >
        {children}
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 group-hover:bg-crm-primary/20 flex-shrink-0 transition-colors">
          <svg className="w-2.5 h-2.5 text-slate-400 group-hover:text-crm-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </span>
      </div>

      {pos && createPortal(
        <div
          style={{ position: "absolute", top: pos.top - 10, left: pos.left, transform: "translate(-50%, -100%)", zIndex: 9999 }}
          className="pointer-events-none"
        >
          <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 min-w-[230px]">

            {/* Handler header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                {getInitials(name || client.company_name)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{name || "—"}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{client.company_name}</p>
              </div>
              <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusCls}`}>{project.status}</span>
            </div>

            <div className="border-t border-slate-100 pt-2.5 space-y-2">
              {/* Phone */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className="text-[11px] text-slate-600">{client.phone || "—"}</span>
              </div>
              {/* Email */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="text-[11px] text-slate-600 truncate">{client.email || "—"}</span>
              </div>
              {/* Service type */}
              {project.service_type && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-[11px] text-slate-600">{project.service_type}</span>
                </div>
              )}
              {/* Timeline */}
              {(startStr || endStr) && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-[11px] text-slate-600">
                    {startStr || "—"} → {endStr || "—"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-200" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-[4px] border-transparent border-t-white" />
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Deal contact tooltip ─────────────────────────────────────────────────────

export function DealContactTip({ deal, leads = [], clients = [], children }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  // Resolve contact — prefer lead, fallback to client
  const lead   = deal.lead_id   ? leads.find(l => l.lead_id === deal.lead_id)     : null;
  const client = deal.client_id ? clients.find(c => c.client_id === deal.client_id) : null;

  const name    = lead ? lead.name         : client ? client.contact_person : null;
  const company = lead ? lead.company      : client ? client.company_name   : null;
  const phone   = lead ? lead.phone        : client ? client.phone          : null;
  const email   = lead ? lead.email        : client ? client.email          : null;
  const type    = lead ? "Lead"            : client ? "Client"              : null;
  const typeClr = lead ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700";

  if (!name && !company) return <>{children}</>;

  const avatarColors = ["bg-blue-200 text-blue-800","bg-rose-200 text-rose-800","bg-violet-200 text-violet-800","bg-teal-200 text-teal-800","bg-amber-200 text-amber-800"];
  const color = avatarColors[(name || "?").charCodeAt(0) % avatarColors.length];

  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>

      {pos && createPortal(
        <div
          style={{ position: "absolute", top: pos.top - 10, left: pos.left, transform: "translate(-50%, -100%)", zIndex: 9999 }}
          className="pointer-events-none"
        >
          <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 min-w-[210px]">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                {getInitials(name || company)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{name || "—"}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{company || "—"}</p>
              </div>
              {type && <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeClr}`}>{type}</span>}
            </div>

            <div className="border-t border-slate-100 pt-2.5 space-y-2">
              {/* Phone */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className="text-[11px] text-slate-600">{phone || "—"}</span>
              </div>
              {/* Email */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="text-[11px] text-slate-600 truncate">{email || "—"}</span>
              </div>
              {/* Deal value */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-[11px] font-semibold text-slate-700">
                  ₹{Number(deal.value || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400">deal value</span>
              </div>
              {/* Close date */}
              {deal.expected_close && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-[11px] text-slate-600">
                    Close: {new Date(deal.expected_close).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-200" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-[4px] border-transparent border-t-white" />
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Client avatar tooltip ────────────────────────────────────────────────────

function getClientPriority(amount) {
  const a = Number(amount || 0);
  if (a >= 1000000) return { label: "High",   cls: "bg-red-100 text-red-700" };
  if (a >= 500000)  return { label: "Medium", cls: "bg-amber-100 text-amber-700" };
  return                   { label: "Low",    cls: "bg-slate-100 text-slate-500" };
}

export function ClientAvatarTip({ client, color, children }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <div ref={ref} className="inline-flex cursor-pointer" onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>

      {pos && createPortal(
        <div
          style={{ position: "absolute", top: pos.top - 10, left: pos.left, transform: "translate(-50%, -100%)", zIndex: 9999 }}
          className="pointer-events-none"
        >
          <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 min-w-[220px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                {getInitials(client.company_name)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{client.company_name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{client.contact_person || "—"}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-2.5 space-y-2">
              {/* Phone */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className="text-[11px] text-slate-600">{client.phone || "—"}</span>
              </div>
              {/* Email */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="text-[11px] text-slate-600 truncate">{client.email || "—"}</span>
              </div>
              {/* Status */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className={`text-[11px] font-semibold ${client.status === "Active" ? "text-emerald-600" : client.status === "On hold" ? "text-amber-600" : "text-slate-400"}`}>
                  {client.status || "Active"}
                </span>
              </div>
              {/* Project */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                </svg>
                <span className="text-[11px] text-slate-600 truncate">{client.project_name || "No project"}</span>
                {client.project_status && (
                  <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    client.project_status === "Active" ? "bg-emerald-100 text-emerald-700" :
                    client.project_status === "Completed" ? "bg-blue-100 text-blue-700" :
                    client.project_status === "On Hold" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>{client.project_status}</span>
                )}
              </div>
              {/* Amount */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-[11px] font-semibold text-slate-700">
                  ₹{Number(client.total_amount || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400">total deals</span>
              </div>
              {/* Priority */}
              {(() => { const p = getClientPriority(client.total_amount); return (
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                </svg>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.cls}`}>{p.label} Priority</span>
              </div>
              ); })()}
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-200" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-[4px] border-transparent border-t-white" />
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Lead avatar tooltip ─────────────────────────────────────────────────────

export function LeadAvatarTip({ lead, color, children }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  const dt = lead.created_at ? new Date(lead.created_at) : null;
  const dateStr = dt ? dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const timeStr = dt ? dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <>
      <div ref={ref} className="inline-flex cursor-pointer" onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>

      {pos && createPortal(
        <div
          style={{ position: "absolute", top: pos.top - 10, left: pos.left, transform: "translate(-50%, -100%)", zIndex: 9999 }}
          className="pointer-events-none"
        >
          <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 min-w-[220px]">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                {getInitials(lead.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{lead.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{lead.company || "—"}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2.5 space-y-2">
              {/* Mobile */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className="text-[11px] text-slate-600">{lead.phone || "—"}</span>
              </div>
              {/* Email */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="text-[11px] text-slate-600 truncate">{lead.email || "—"}</span>
              </div>
              {/* Date & Time */}
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="text-[11px] text-slate-600">{dateStr}</span>
                <span className="text-[11px] text-slate-400">{timeStr}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-200" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-[4px] border-transparent border-t-white" />
        </div>,
        document.body
      )}
    </>
  );
}
