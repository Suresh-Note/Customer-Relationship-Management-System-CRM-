import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";
import Sidebar from "./Sidebar";
import NotificationPanel from "./NotificationPanel";

/** Modal shown during the idle-warning countdown */
function IdleWarningModal({ countdown, onStayLoggedIn }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          ⏱️
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Still there?</h2>
        <p className="text-sm text-slate-500 mb-1">
          You've been inactive for a while.
        </p>
        <p className="text-sm text-slate-500 mb-6">
          You'll be logged out automatically in{" "}
          <span className="font-bold text-amber-600">{countdown}s</span>.
        </p>
        <button
          onClick={onStayLoggedIn}
          className="w-full py-2.5 rounded-xl bg-crm-primary text-white text-sm font-semibold hover:bg-crm-primary/90 transition-colors"
        >
          Stay logged in
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const { logout }     = useAuth();
  const [collapsed, setCollapsed]   = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);

  const handleIdleTimeout = async () => {
    await logout({ redirectTo: "/login?reason=idle" });
  };

  const { isWarning, countdown, dismissWarning } = useIdleTimeout({
    onTimeout:   handleIdleTimeout,
    idleMinutes: 25,   // warn after 25 min inactivity
    warnSeconds: 60,   // give 60s to respond before auto-logout
  });

  return (
    <div className="min-h-screen bg-crm-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <main className={`transition-all duration-300 ease-in-out ${collapsed ? "ml-[72px]" : "ml-[230px]"}`}>
        <Outlet context={{ onBellClick: () => setNotifOpen(true) }} />
      </main>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Idle session warning */}
      {isWarning && (
        <IdleWarningModal countdown={countdown} onStayLoggedIn={dismissWarning} />
      )}
    </div>
  );
}
