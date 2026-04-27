import React, { useEffect, useState } from "react";
import api from "../../services/api";

const TYPE_ICON = {
  job_request_received: { icon: "📩", color: "bg-yellow-100 text-yellow-600" },
  job_accepted:         { icon: "✅", color: "bg-green-100 text-green-600"  },
  job_rejected:         { icon: "❌", color: "bg-red-100 text-red-500"      },
  job_cancelled:        { icon: "🚫", color: "bg-gray-100 text-gray-500"    },
  job_expired:          { icon: "⏰", color: "bg-orange-100 text-orange-600"},
  job_marked_done:      { icon: "🏁", color: "bg-indigo-100 text-indigo-600"},
  job_confirmed:        { icon: "🎉", color: "bg-teal-100 text-teal-600"    },
  admin_approved:       { icon: "🎖️", color: "bg-teal-100 text-teal-600"   },
  admin_rejected:       { icon: "❌", color: "bg-red-100 text-red-500"      },
  otp_success:          { icon: "🔐", color: "bg-blue-100 text-blue-600"    },
};

function relativeTime(dateStr) {
  const now  = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)         return "Just now";
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2 * 86400)  return "Yesterday";
  return date.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function groupByDay(notifications) {
  const groups = {};
  notifications.forEach(n => {
    const d = new Date(n.sentAt || n.createdAt);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    let label;
    if (d.toDateString() === today.toDateString())     label = "TODAY";
    else if (d.toDateString() === yesterday.toDateString()) label = "YESTERDAY";
    else label = "EARLIER";
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  const ORDER = ["TODAY", "YESTERDAY", "EARLIER"];
  return ORDER.filter(k => groups[k]).map(k => ({ label: k, items: groups[k] }));
}

export default function WorkerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);

  const unread = notifications.filter(n => !n.isRead).length;

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* best effort */ }
    finally { setMarkingAll(false); }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const grouped = groupByDay(notifications);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 mt-3">Loading notifications...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            🔔 Notifications
          </h1>
          {unread > 0 && (
            <span className="bg-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unread} unread
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
          >
            ✓ Mark All as Read
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-4xl mb-3">🔕</p>
          <p className="text-slate-500 font-semibold text-sm">No notifications yet</p>
          <p className="text-slate-400 text-xs mt-1">You'll be notified about job requests and updates here.</p>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-6">
        {grouped.map(group => (
          <div key={group.label}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map(n => {
                const meta = TYPE_ICON[n.type] || { icon: "🔔", color: "bg-slate-100 text-slate-500" };
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markOneRead(n._id)}
                    className={`flex items-start gap-4 bg-white rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-sm ${
                      n.isRead ? "border-slate-100" : "border-teal-200 shadow-sm"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta.color}`}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${n.isRead ? "text-slate-600" : "text-slate-800"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5">{relativeTime(n.sentAt || n.createdAt)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}