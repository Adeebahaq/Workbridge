import React from "react";
import { Phone, MapPin, ChevronRight } from "lucide-react";
import { initials } from "./Dashboard";

export default function PendingRow({ worker, onReview }) {
  const name = worker.userId?.fullName || "Unknown";
  const services = (worker.services || []).slice(0, 2);
  const days = Math.floor((Date.now() - new Date(worker.submittedAt)) / 86400000);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 hover:border-amber-200 hover:shadow-md transition-all">
      
      {/* Top row: avatar + name/phone + badge */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm shrink-0">
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{name}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Phone size={10} /> {worker.userId?.phone}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
          days === 0 ? "bg-blue-100 text-blue-600" 
          : days <= 1 ? "bg-amber-100 text-amber-600" 
          : "bg-red-100 text-red-600"
        }`}>
          {days === 0 ? "New today" : `${days}d waiting`}
        </span>
      </div>

      {/* Middle row: services + city */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {services.map(s => (
          <span key={s._id || s} className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
            {s.name || s}
          </span>
        ))}
        <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <MapPin size={10} /> {worker.preferredCity}
        </p>
      </div>

      {/* Bottom row: Review button */}
      <button
        onClick={() => onReview(worker)}
        className="w-full flex items-center justify-center gap-1 bg-[#0F172A] hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
      >
        Review <ChevronRight size={12} />
      </button>
    </div>
  );
}