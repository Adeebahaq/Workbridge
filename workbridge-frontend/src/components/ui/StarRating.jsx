import React, { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, readOnly = false, size = 24 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => !readOnly && onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`transition-all focus:outline-none ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            style={{ background: "none", border: "none", padding: 2 }}
          >
            <Star
              size={size}
              className={`transition-colors ${n <= active ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
            />
          </button>
        ))}
      </div>
      {!readOnly && active > 0 && (
        <span className="text-xs font-semibold text-slate-500">{LABELS[active]}</span>
      )}
    </div>
  );
}