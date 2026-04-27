import React, { useRef } from "react";

export default function OtpInput({ value = ["","","","","",""], onChange }) {
  const refs = useRef([]);

  const handleChange = (i, raw) => {
    const digit = raw.slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...value];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {value.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          maxLength={1}
          inputMode="numeric"
          style={{
            width: "52px", height: "60px", textAlign: "center",
            fontSize: "24px", fontWeight: 700, fontFamily: "inherit",
            border: "1.5px solid #e5e5e5", borderRadius: "10px",
            outline: "none", transition: "border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = "#2a9d8f"}
          onBlur={e  => e.target.style.borderColor = "#e5e5e5"}
        />
      ))}
    </div>
  );
}