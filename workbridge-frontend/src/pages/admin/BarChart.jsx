import React from "react";

const JOB_STATUS_COLORS = {
  requested: "#F59E0B", accepted: "#3B82F6", inProgress: "#6366F1",
  awaitingConfirmation: "#A855F7", completed: "#10B981",
  rejected: "#EF4444", cancelled: "#94A3B8", expired: "#F97316",
};

const LABELS = {
  requested: "Req", accepted: "Acc", inProgress: "Prog",
  awaitingConfirmation: "Wait", completed: "Done",
  rejected: "Rej", cancelled: "Canc", expired: "Exp",
};

export default function BarChart({ data }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="flex items-end gap-1 sm:gap-2 h-32 mt-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-500">{val > 0 ? val : ""}</span>
          <div className="w-full rounded-t-lg transition-all duration-700"
            style={{
              height: `${Math.max((val / max) * 100, val > 0 ? 8 : 0)}%`,
              backgroundColor: JOB_STATUS_COLORS[key] || "#94A3B8",
              minHeight: val > 0 ? "6px" : "2px",
              opacity: val > 0 ? 1 : 0.2,
            }}
          />
          <span className="text-[9px] text-slate-400 font-semibold truncate w-full text-center">{LABELS[key]}</span>
        </div>
      ))}
    </div>
  );
}