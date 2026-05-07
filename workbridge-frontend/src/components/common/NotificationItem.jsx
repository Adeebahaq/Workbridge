import React from "react";
import {
  CheckCircle, XCircle, Clock, CheckCheck,
  Briefcase, MessageSquare, Star, Bell, ShieldCheck, KeyRound, Play
} from "lucide-react";

const TYPE_META = {
  job_accepted:         { Icon: CheckCircle,   bg: "#dcfce7", color: "#16a34a", label: "Job Accepted"      },
  job_rejected:         { Icon: XCircle,       bg: "#fee2e2", color: "#dc2626", label: "Job Rejected"      },
  job_cancelled:        { Icon: XCircle,       bg: "#f1f5f9", color: "#64748b", label: "Job Cancelled"     },
  job_expired:          { Icon: Clock,         bg: "#ffedd5", color: "#ea580c", label: "Request Expired"   },
  job_marked_done:      { Icon: CheckCheck,    bg: "#ede9fe", color: "#7c3aed", label: "Job Marked Done"   },
  job_confirmed:        { Icon: CheckCircle,   bg: "#ccfbf1", color: "#0d9488", label: "Job Confirmed"     },
  job_request_received: { Icon: Briefcase,     bg: "#fef9c3", color: "#ca8a04", label: "New Job Request"   },
  job_started:          { Icon: Play,          bg: "#dbeafe", color: "#2563eb", label: "Job Started"       },
  new_message:          { Icon: MessageSquare, bg: "#dbeafe", color: "#2563eb", label: "New Message"       },
  rating_received:      { Icon: Star,          bg: "#fef9c3", color: "#d97706", label: "New Rating"        },
  admin_approved:       { Icon: ShieldCheck,   bg: "#ccfbf1", color: "#0d9488", label: "Admin Approved"    },
  admin_rejected:       { Icon: XCircle,       bg: "#fee2e2", color: "#dc2626", label: "Admin Rejected"    },
  otp_success:          { Icon: KeyRound,      bg: "#dbeafe", color: "#2563eb", label: "OTP Verified"      },
};

function relativeTime(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60)        return "Just now";
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2 * 86400) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationItem({ notification: n, onMarkRead }) {
  const meta = TYPE_META[n.type] || { Icon: Bell, bg: "#f1f5f9", color: "#64748b", label: "Update" };
  const { Icon } = meta;

  return (
    <div
      onClick={() => !n.isRead && onMarkRead?.(n._id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        padding: "14px 16px",
        borderBottom: "1px solid #f1f5f9",
        background: n.isRead ? "#ffffff" : "#f0fdf9",
        cursor: n.isRead ? "default" : "pointer",
        transition: "background 0.25s ease",
        position: "relative",
      }}
      onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = "#e6faf5"; }}
      onMouseLeave={e => { if (!n.isRead) e.currentTarget.style.background = "#f0fdf9"; }}
    >
      {/* Unread left bar */}
      {!n.isRead && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "3px", background: "#0d9488", borderRadius: "0 2px 2px 0"
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: meta.bg,
      }}>
        <Icon size={18} color={meta.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <p style={{
            margin: 0,
            fontSize: "13.5px",
            fontWeight: n.isRead ? "500" : "700",
            color: n.isRead ? "#64748b" : "#0f172a",
            letterSpacing: "-0.01em",
          }}>
            {n.title}
          </p>
          <span style={{
            fontSize: "11px",
            color: n.isRead ? "#94a3b8" : "#0d9488",
            fontWeight: n.isRead ? "400" : "600",
            flexShrink: 0,
          }}>
            {relativeTime(n.sentAt || n.createdAt)}
          </span>
        </div>
        <p style={{
          margin: "3px 0 0",
          fontSize: "12.5px",
          color: n.isRead ? "#94a3b8" : "#475569",
          lineHeight: "1.5",
          fontWeight: n.isRead ? "400" : "500",
        }}>
          {n.body}
        </p>
      </div>

      {/* Unread dot */}
      {!n.isRead && (
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#0d9488", flexShrink: 0, marginTop: "5px",
        }} />
      )}
    </div>
  );
}