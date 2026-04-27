import React from "react";

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(p => p[0] || "").join("").toUpperCase() || "?";
}

export default function Avatar({ name = "", size = "md", style = {} }) {
  const sizes = { sm: 36, md: 44, lg: 64, xl: 80 };
  const fonts  = { sm: 13, md: 15, lg: 20, xl: 24 };
  const px = sizes[size] || 44;
  return (
    <div style={{
      width: px, height: px, borderRadius: "50%",
      background: "#d6f5ef", color: "#2a9d8f",
      fontWeight: 700, fontSize: fonts[size] || 15,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, userSelect: "none", ...style,
    }}>
      {initials(name)}
    </div>
  );
}