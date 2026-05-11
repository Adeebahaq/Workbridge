import React from "react";
import { Inbox, CheckCircle, RefreshCw, Flag, XCircle } from "lucide-react";
import DonutChart from "./DonutChart";
import BarChart from "./BarChart";

const JOB_STATUS_COLORS = {
  requested: "#F59E0B", accepted: "#3B82F6", inProgress: "#6366F1",
  awaitingConfirmation: "#A855F7", completed: "#10B981",
  rejected: "#EF4444", cancelled: "#94A3B8", expired: "#F97316",
};

const JOB_STAT_CARDS = [
  { key: "requested",  label: "Requested",   Icon: Inbox },
  { key: "accepted",   label: "Accepted",    Icon: CheckCircle },
  { key: "inProgress", label: "In Progress", Icon: RefreshCw },
  { key: "completed",  label: "Completed",   Icon: Flag },
  { key: "rejected",   label: "Rejected",    Icon: XCircle },
];

export default function StatsTab({ dataLoading, jobData, allJobData }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Job Stats</h1>
        <p className="text-sm text-slate-400">Platform-wide job activity and trends</p>
      </div>

      {/* Stat cards — 2 cols on mobile, 5 on lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {dataLoading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-200 mx-auto mb-2" />
              <div className="h-7 w-8 bg-slate-200 rounded mx-auto mb-1" />
              <div className="h-2 w-16 bg-slate-100 rounded mx-auto" />
            </div>
          ))
        ) : (
          JOB_STAT_CARDS.map(({ key, label, Icon }) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 sm:p-4 text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: JOB_STATUS_COLORS[key] + "20", color: JOB_STATUS_COLORS[key] }}
              >
                <Icon size={20} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-800">{allJobData?.[key] ?? 0}</p>
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide leading-tight">{label}</p>
            </div>
          ))
        )}
      </div>

      {/* Today's breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black text-slate-800">Today's Breakdown</h3>
          <span className="text-xs text-slate-400">
            Total: {dataLoading ? "…" : Object.values(jobData).reduce((a, b) => a + b, 0)} jobs
          </span>
        </div>
        {dataLoading ? (
          <div className="flex items-end gap-2 h-32 mt-2 animate-pulse">
            {[60, 40, 80, 30, 90, 20, 50, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-100 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : (
          <BarChart data={jobData} />
        )}
      </div>

      {/* All-time breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black text-slate-800">All-Time Breakdown</h3>
          <span className="text-xs text-slate-400">
            Total: {dataLoading ? "…" : Object.values(allJobData).reduce((a, b) => a + b, 0)} jobs
          </span>
        </div>
        {dataLoading ? (
          <div className="flex items-end gap-2 h-32 mt-2 animate-pulse">
            {[60, 40, 80, 30, 90, 20, 50, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-100 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : (
          <BarChart data={allJobData} />
        )}
      </div>
    </div>
  );
}