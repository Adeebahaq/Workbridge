import React, { useState } from "react";

export default function StarRating({ value = 0, onChange, readOnly = false, size = 28 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div style={{ display: "inline-flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            fontSize: size, cursor: readOnly ? "default" : "pointer",
            color: n <= active ? "#f59e0b" : "#d1d5db",
            transition: "color 0.1s", userSelect: "none",
          }}
        >★</span>
      ))}
    </div>
  );
}