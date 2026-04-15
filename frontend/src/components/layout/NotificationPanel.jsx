import React from "react";
import { useNavigate } from "react-router-dom";

import { notifications } from "../../data/dummyData";
import { getNotificationDestination } from "../../utils/notificationRouting";

function NotificationSection({ title, items, onItemClick }) {
  if (!items.length) return null;

  return (
    <section className="px-6 py-5 border-t border-slate-100 first:border-t-0">
      <h3 className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase mb-4">
        {title}
      </h3>

      <div className="space-y-3">
        {items.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => onItemClick(notification)}
            className="w-full text-left rounded-3xl border border-transparent bg-slate-50/90 px-4 py-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary/20"
          >
            <div className="flex items-start gap-4">
              <span
                className={`mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full ${notification.color}`}
                aria-hidden="true"
              />

              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-6 text-slate-800">
                  {notification.title}
                </p>
                <p className="mt-0.5 text-sm leading-6 text-slate-500">
                  {notification.desc}
                </p>
                <p className="mt-2 text-sm text-slate-400">{notification.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function NotificationPanel({ open, onClose }) {
  const navigate = useNavigate();

  const todayItems = notifications.filter(
    (notification) => notification.time.toLowerCase() !== "yesterday"
  );
  const yesterdayItems = notifications.filter(
    (notification) => notification.time.toLowerCase() === "yesterday"
  );

  const handleNotificationClick = (notification) => {
    const destination = getNotificationDestination(notification);
    onClose?.();
    navigate(destination.pathname, { state: destination.state });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] transition-opacity ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[430px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-6">
          <h2 className="text-[22px] font-bold text-slate-900">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close notifications"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NotificationSection title="Today" items={todayItems} onItemClick={handleNotificationClick} />
          <NotificationSection title="Yesterday" items={yesterdayItems} onItemClick={handleNotificationClick} />
        </div>
      </aside>
    </>
  );
}
