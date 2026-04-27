import React from "react";

const VARIANTS = {
  available:     { bg: "#dcfce7", color: "#166534" },
  busy:          { bg: "#fee2e2", color: "#991b1b" },
  requested:     { bg: "#fef9c3", color: "#854d0e" },
  accepted:      { bg: "#dcfce7", color: "#166534" },
  "in-progress": { bg: "#dbeafe", color: "#1e40af" },
  awaiting:      { bg: "#f3e8ff", color: "#7c3aed" },
  completed:     { bg: "#dcfce7", color: "#166534" },
  rejected:      { bg: "#fee2e2", color: "#991b1b" },
  cancelled:     { bg: "#f3f4f6", color: "#6b7280" },
  expired:       { bg: "#ffedd5", color: "#9a3412" },
  pending:       { bg: "#fef9c3", color: "#854d0e" },
  verified:      { bg: "#dcfce7", color: "#166534" },
  default:       { bg: "#f3f4f6", color: "#374151" },
};

export default function Badge({ children, variant = "default", dot = false, style = {} }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 12px", borderRadius: "999px",
      fontSize: "12px", fontWeight: 600,
      background: v.bg, color: v.color, ...style,
    }}>
      {dot && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: v.color, flexShrink: 0 }} />}
      {children}
    </span>
  );
}