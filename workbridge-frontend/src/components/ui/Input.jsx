import React from "react";

export default function Input({
  label, name, type = "text", value, onChange, placeholder,
  required = false, error = "", hint = "", disabled = false,
  style = {}, inputStyle = {},
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
      {label && (
        <label htmlFor={name} style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
      )}
      <input
        id={name} name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder}
        required={required} disabled={disabled}
        style={{
          width: "100%", padding: "12px 14px", minHeight: "48px",
          border: `1.5px solid ${error ? "#ef4444" : "#e5e5e5"}`,
          borderRadius: "10px", fontSize: "15px", fontFamily: "inherit",
          color: "#1a1a1a", background: disabled ? "#f9fafb" : "white",
          outline: "none", transition: "border-color 0.15s", ...inputStyle,
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = "#2a9d8f"; }}
        onBlur={e  => { if (!error) e.target.style.borderColor = "#e5e5e5"; }}
      />
      {error && <span style={{ fontSize: "12px", color: "#ef4444" }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: "12px", color: "#9ca3af" }}>{hint}</span>}
    </div>
  );
}