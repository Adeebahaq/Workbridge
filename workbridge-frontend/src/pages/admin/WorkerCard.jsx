import React from "react";
import { Phone, MapPin, ChevronRight } from "lucide-react";
import { initials, relTime, STATUS_META } from "./Dashboard";

export default function WorkerCard({ worker, onReview }) {
  const name = worker.userId?.fullName || "Unknown";
  const meta = STATUS_META[worker.status] || STATUS_META["Inactive"];
  const services = (worker.services || []).slice(0, 2);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-slate-800 text-sm truncate">{name}</p>
            <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Phone size={10} /> {worker.userId?.phone}</p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {worker.preferredCity}</p>
          <div className="flex flex-wrap gap-1 mt-2 max-w-full">
            {services.map(s => (
              <span key={s._id || s} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.name || s}</span>
            ))}
            {worker.services?.length > 2 && (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">+{worker.services.length - 2}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-slate-400">{relTime(worker.submittedAt)}</span>
            <button onClick={() => onReview(worker)}
              className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition-all">
              Review <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}