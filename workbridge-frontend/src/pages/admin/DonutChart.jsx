import React from "react";

const JOB_STATUS_COLORS = {
  requested: "#F59E0B", accepted: "#3B82F6", inProgress: "#6366F1",
  awaitingConfirmation: "#A855F7", completed: "#10B981",
  rejected: "#EF4444", cancelled: "#94A3B8", expired: "#F97316",
};

export default function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center w-40 h-40 rounded-full border-8 border-slate-100 text-slate-400 text-xs font-semibold">
      No Data
    </div>
  );
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  let cumulative = 0;
  const r = 60, cx = 70, cy = 70, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  const segments = entries.map(([key, value]) => {
    const pct = value / total;
    const seg = { key, value, pct, start: cumulative };
    cumulative += pct;
    return seg;
  });
  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40 -rotate-90">
      {segments.map(({ key, pct, start }) => (
        <circle key={key} cx={cx} cy={cy} r={r} fill="none"
          stroke={JOB_STATUS_COLORS[key] || "#94A3B8"}
          strokeWidth={strokeW}
          strokeDasharray={`${pct * circumference} ${circumference}`}
          strokeDashoffset={-start * circumference}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      ))}
    </svg>
  );
}