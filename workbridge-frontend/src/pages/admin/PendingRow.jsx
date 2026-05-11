import React from "react";
import { Phone, MapPin, ChevronRight } from "lucide-react";
import { initials } from "./Dashboard";

export default function PendingRow({ worker, onReview }) {
  const name = worker.userId?.fullName || "Unknown";
  const services = (worker.services || []).slice(0, 2);
  const days = Math.floor((Date.now() - new Date(worker.submittedAt)) / 86400000);
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 hover:border-amber-200 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm shrink-0">
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={10} /> {worker.userId?.phone}</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {services.map(s => (
          <span key={s._id || s} className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">{s.name || s}</span>
        ))}
      </div>
      <p className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 whitespace-nowrap"><MapPin size={10} /> {worker.preferredCity}</p>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${days === 0 ? "bg-blue-100 text-blue-600" : days <= 1 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
        {days === 0 ? "New today" : `${days}d waiting`}
      </span>
      <button onClick={() => onReview(worker)}
        className="shrink-0 flex items-center gap-1 bg-[#0F172A] hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all w-full sm:w-auto justify-center">
        Review <ChevronRight size={12} />
      </button>
    </div>
  );
}