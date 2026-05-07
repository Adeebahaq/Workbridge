import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import {
  CheckCircle, XCircle, Clock, CheckCheck,
  Briefcase, MessageSquare, Star, Bell, ShieldCheck, KeyRound, Play, X
} from "lucide-react";

const TYPE_META = {
  job_accepted:         { Icon: CheckCircle,   bg: "#dcfce7", color: "#16a34a" },
  job_rejected:         { Icon: XCircle,       bg: "#fee2e2", color: "#dc2626" },
  job_cancelled:        { Icon: XCircle,       bg: "#f1f5f9", color: "#64748b" },
  job_expired:          { Icon: Clock,         bg: "#ffedd5", color: "#ea580c" },
  job_marked_done:      { Icon: CheckCheck,    bg: "#ede9fe", color: "#7c3aed" },
  job_confirmed:        { Icon: CheckCircle,   bg: "#ccfbf1", color: "#0d9488" },
  job_request_received: { Icon: Briefcase,     bg: "#fef9c3", color: "#ca8a04" },
  job_started:          { Icon: Play,          bg: "#dbeafe", color: "#2563eb" },
  new_message:          { Icon: MessageSquare, bg: "#dbeafe", color: "#2563eb" },
  rating_received:      { Icon: Star,          bg: "#fef9c3", color: "#d97706" },
  admin_approved:       { Icon: ShieldCheck,   bg: "#ccfbf1", color: "#0d9488" },
  admin_rejected:       { Icon: XCircle,       bg: "#fee2e2", color: "#dc2626" },
  otp_success:          { Icon: KeyRound,      bg: "#dbeafe", color: "#2563eb" },
};

function Toast({ notification, onClose }) {
  const meta = TYPE_META[notification.type] || { Icon: Bell, bg: "#f1f5f9", color: "#64748b" };
  const { Icon } = meta;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true));
    // Auto dismiss after 5s
    const timer = setTimeout(() => handleClose(), 5000);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 350); // wait for slide-out animation
  }

  return (
    <>
      <style>{`
        @keyframes wb-slide-in {
          from { transform: translateY(-110%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes wb-slide-out {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-110%); opacity: 0; }
        }
        .wb-toast-progress {
          height: 3px;
          background: #0d9488;
          border-radius: 0 0 0 12px;
          animation: wb-progress 5s linear forwards;
        }
        @keyframes wb-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div style={{
        animation: visible ? "wb-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards"
                           : "wb-slide-out 0.3s ease forwards",
        background: "white",
        borderRadius: "14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        width: "340px",
        maxWidth: "calc(100vw - 32px)",
        border: "1px solid #e2e8f0",
      }}>
        {/* Progress bar */}
        <div className="wb-toast-progress" />

        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 14px 14px 14px" }}>
          {/* Icon */}
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: meta.bg,
          }}>
            <Icon size={18} color={meta.color} />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.01em" }}>
              {notification.title}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
              {notification.body}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "2px", color: "#94a3b8", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "6px",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#475569"}
            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

export default function NotificationToast() {
  const { socket } = useContext(AuthContext);
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!socket) return;

    const handleNew = (notification) => {
      const id = ++counterRef.current;
      setToasts(prev => [...prev, { id, notification }]);
    };

    socket.on("new_notification", handleNew);
    return () => socket.off("new_notification", handleNew);
  }, [socket]);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      alignItems: "center",
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: "all" }}>
          <Toast notification={t.notification} onClose={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}