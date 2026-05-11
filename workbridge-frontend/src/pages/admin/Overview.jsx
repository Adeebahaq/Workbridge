import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Building2, UserCheck, Clock, Plus, PartyPopper, MapPin, ChevronRight } from "lucide-react";
import { initials } from "./Dashboard";
import DonutChart from "./DonutChart";

const STAT_CARDS = [
  { label: "Total Workers",   valKey: "totalWorkers",         Icon: Wrench,    bgColor: "bg-blue-50",    iconColor: "text-blue-600" },
  { label: "Total Employers", valKey: "totalEmployers",       Icon: Building2, bgColor: "bg-purple-50",  iconColor: "text-purple-600" },
  { label: "Active Workers",  valKey: "activeWorkers",        Icon: UserCheck, bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "Pending Review",  valKey: "pendingVerifications", Icon: Clock,     bgColor: "bg-amber-50",   iconColor: "text-amber-600" },
];

const JOB_STATUS_COLORS = {
  requested: "#F59E0B", accepted: "#3B82F6", inProgress: "#6366F1",
  awaitingConfirmation: "#A855F7", completed: "#10B981",
  rejected: "#EF4444", cancelled: "#94A3B8", expired: "#F97316",
};

const JOB_LABELS = {
  requested: "Requested", accepted: "Accepted", inProgress: "In Progress",
  awaitingConfirmation: "Awaiting", completed: "Completed",
  rejected: "Rejected", cancelled: "Cancelled", expired: "Expired",
};

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-200 mb-3" />
      <div className="h-7 w-12 bg-slate-200 rounded mb-1" />
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
  );
}

export default function OverviewTab({ metrics, pending, dataLoading, jobData, onSelectWorker, onCreateWorker, navigate }) {
  const total = Object.values(jobData).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-400">Platform overview and key metrics</p>
        </div>
        <button
          onClick={onCreateWorker}
          className="flex items-center gap-2 bg-[#0F172A]hover:bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all w-full justify-center text-xs sm:text-sm"
        >
          <Plus size={15} /> Create Worker Account
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {dataLoading
          ? [1, 2, 3, 4].map(i => <StatSkeleton key={i} />)
          : STAT_CARDS.map(({ label, valKey, Icon, bgColor, iconColor }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-5">
              <div className={`w-10 h-10 rounded-xl ${bgColor} ${iconColor} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-800">{metrics?.[valKey] ?? "—"}</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
            </div>
          ))
        }
      </div>

      {/* Bottom 2-col */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-slate-800 mb-4">Today's Job Activity</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <DonutChart data={jobData} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-black text-slate-800">{dataLoading ? "…" : total}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Total</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 flex-1 w-full">
              {dataLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-3 bg-slate-100 rounded w-full" />)}
                </div>
              ) : (
                Object.entries(jobData).filter(([, v]) => v > 0).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: JOB_STATUS_COLORS[key] }} />
                    <span className="text-xs text-slate-500 flex-1">{JOB_LABELS[key]}</span>
                    <span className="text-xs font-black text-slate-700">{val}</span>
                    <span className="text-[10px] text-slate-400 w-8 text-right">{Math.round(val / (total || 1) * 100)}%</span>
                  </div>
                ))
              )}
              {!dataLoading && Object.values(jobData).every(v => v === 0) && (
                <p className="text-sm text-slate-400">No jobs today yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Pending quick list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800">Pending Verifications</h3>
            {pending.length > 0 && (
              <button onClick={() => navigate("/admin/verify")} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">
                View all
              </button>
            )}
          </div>
          {dataLoading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-2 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-2"><PartyPopper size={32} className="text-teal-400" /></div>
              <p className="text-sm text-slate-400 font-semibold">All caught up!</p>
              <p className="text-xs text-slate-400">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 4).map(w => (
                <div key={w._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all" onClick={() => onSelectWorker(w)}>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                    {initials(w.userId?.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{w.userId?.fullName}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} /> {w.preferredCity}</p>
                  </div>
                  <span className="text-xs font-bold text-teal-600 flex items-center gap-0.5 shrink-0">Review <ChevronRight size={12} /></span>
                </div>
              ))}
              {pending.length > 4 && (
                <button onClick={() => navigate("/admin/verify")} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-1 transition-all">
                  +{pending.length - 4} more pending
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}