import React from "react";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationItem from "../../components/common/NotificationItem";

function groupByDay(notifications) {
  const groups = {};
  notifications.forEach(n => {
    const d         = new Date(n.sentAt || n.createdAt);
    const today     = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const label =
      d.toDateString() === today.toDateString()       ? "Today"
      : d.toDateString() === yesterday.toDateString() ? "Yesterday"
      : d.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return Object.keys(groups).map(k => ({ label: k, items: groups[k] }));
}

export default function WorkerNotifications() {
const { notifications, unreadCount, loading, markOneRead, markAllRead } = useNotifications();  const grouped = groupByDay(notifications);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "32px", height: "32px", border: "3px solid #0d9488",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto"
        }} />
        <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px 12px" }}>

      {/* Header — wraps on very small screens */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "8px", marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <Bell size={20} color="#0d9488" style={{ flexShrink: 0 }} />
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span style={{
              background: "#0d9488", color: "white", fontSize: "11px",
              fontWeight: "700", padding: "2px 8px", borderRadius: "99px",
              whiteSpace: "nowrap", flexShrink: 0
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "1px solid #e2e8f0",
              color: "#475569", fontSize: "12px", fontWeight: "600",
              padding: "6px 12px", borderRadius: "8px", cursor: "pointer",
              transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div style={{
          background: "white", borderRadius: "16px", border: "1px solid #f1f5f9",
          padding: "48px 16px", textAlign: "center",
        }}>
          <Inbox size={36} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>All caught up</p>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>
            Job requests, ratings and updates will appear here.
          </p>
        </div>
      )}

      {/* List */}
      {notifications.length > 0 && (
        <div style={{
          background: "white", borderRadius: "16px",
          border: "1px solid #e2e8f0", overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {grouped.map((group, gi) => (
            <div key={group.label}>
              <div style={{
                padding: "8px 16px", background: "#f8fafc",
                borderBottom: "1px solid #f1f5f9",
                borderTop: gi > 0 ? "1px solid #e2e8f0" : "none",
              }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {group.label}
                </span>
              </div>
              {group.items.map(n => (
                <NotificationItem key={n._id} notification={n} onMarkRead={markOneRead} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}