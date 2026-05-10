import React from "react";
import { Search, HardHat } from "lucide-react";
import WorkerCard from "./WorkerCard";

const STATUS_FILTERS = [
  { val: "",                     label: "All" },
  { val: "Active",               label: "Active" },
  { val: "Pending Verification", label: "Pending" },
  { val: "Rejected",             label: "Rejected" },
  { val: "Suspended",            label: "Suspended" },
];

export default function AllWorkersTab({
  allWorkers, visibleWorkers, filterStatus, workerSearch,
  dataLoading, onSearch, onFilter, onSelectWorker,
}) {
  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">All Workers</h1>
          <p className="text-sm text-slate-400">Browse all registered workers on the platform</p>
        </div>
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, city..."
            value={workerSearch}
            onChange={e => onSearch(e.target.value)}
            className="border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 w-full"
          />
        </div>
      </div>

      {/* Filter pills — scrollable on mobile */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 w-max">
          {STATUS_FILTERS.map(({ val, label }) => {
            const count = val === "" ? allWorkers.length : allWorkers.filter(w => w.status === val).length;
            return (
              <button key={val} onClick={() => onFilter(val)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === val ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"
                }`}>
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filterStatus === val ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {dataLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded w-3/4" />
              <div className="h-7 bg-slate-100 rounded-lg w-20 ml-auto" />
            </div>
          ))}
        </div>
      ) : visibleWorkers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="flex justify-center mb-3"><HardHat size={40} className="text-slate-300" /></div>
          <p className="text-slate-500 font-semibold text-sm">No workers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {visibleWorkers.map(w => (
            <WorkerCard key={w._id} worker={w} onReview={onSelectWorker} />
          ))}
        </div>
      )}
    </div>
  );
}