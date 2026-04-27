import React from "react";

export default function Button({
  children, onClick, type = "button", variant = "dark",
  size = "md", disabled = false, fullWidth = false, style = {}, ...rest
}) {
  const sizes = {
    sm: { fontSize: "13px", padding: "8px 16px", minHeight: "36px" },
    md: { fontSize: "15px", padding: "12px 24px", minHeight: "48px" },
    lg: { fontSize: "16px", padding: "14px 32px", minHeight: "54px" },
  };
  const variants = {
    dark:    { background: "#1e1e1e", color: "white", border: "none" },
    outline: { background: "white", color: "#1e1e1e", border: "1.5px solid #1e1e1e" },
    teal:    { background: "#5ecfb8", color: "white", border: "none" },
    danger:  { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
    ghost:   { background: "transparent", color: "#6b7280", border: "1.5px solid #e5e5e5" },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: "8px", fontWeight: 600, fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: "10px", transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : "auto",
        ...sizes[size], ...variants[variant], ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}