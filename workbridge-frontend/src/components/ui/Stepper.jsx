import React from "react";

export default function Stepper({ steps = [], current = 0 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "13px",
              background: i < current ? "#d1fae5" : i === current ? "#1e1e1e" : "white",
              color:      i < current ? "#065f46" : i === current ? "white"    : "#9ca3af",
              border: `2px solid ${i < current ? "#6ee7b7" : i === current ? "#1e1e1e" : "#e5e5e5"}`,
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
              color: i === current ? "#1a1a1a" : "#9ca3af",
            }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: "2px",
              background: i < current ? "#5ecfb8" : "#e5e5e5",
              margin: "0 4px 18px",
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}