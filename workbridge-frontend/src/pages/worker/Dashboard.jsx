import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { useJobManagement } from "../../hooks/useJobManagement";

const STATUS_STYLE = {
  Requested:               "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Accepted:                "bg-blue-100 text-blue-700 border border-blue-200",
  "In Progress":           "bg-indigo-100 text-indigo-700 border border-indigo-200",
  "Awaiting Confirmation": "bg-purple-100 text-purple-700 border border-purple-200",
  Completed:               "bg-green-100 text-green-700 border border-green-200",
  Rejected:                "bg-red-100 text-red-700 border border-red-200",
  Cancelled:               "bg-gray-100 text-gray-500 border border-gray-200",
  Expired:                 "bg-orange-100 text-orange-700 border border-orange-200",
};

const STATUS_DOT = {
  Requested:               "bg-yellow-400",
  Accepted:                "bg-blue-400",
  "In Progress":           "bg-indigo-400",
  "Awaiting Confirmation": "bg-purple-400",
  Completed:               "bg-green-500",
  Rejected:                "bg-red-400",
  Cancelled:               "bg-gray-400",
  Expired:                 "bg-orange-400",
};

const HIRING_ICON = {
  Hourly:  "🕐",
  Daily:   "📅",
  Weekly:  "📆",
  Monthly: "🗓️",
};

const REJECTION_REASONS = [
  "Already have a worker for this job",
  "Job location is too far",
  "Job date does not match my availability",
  "Hiring type does not suit me",
  "I am already booked on that date",
  "Job duration is too short",
  "Job duration is too long",
  "Other",
];

const TABS = ["All", "Pending", "In Progress", "Completed"];

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function RejectModal({ job, onClose, onConfirm }) {
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-bold text-slate-800 mb-1">Reject Job Request</h3>
        <p className="text-sm text-slate-500 mb-4">Select a reason for rejecting this request.</p>
        <select
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          {REJECTION_REASONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onAccept, onReject, onMarkDone, loading }) {
  const [expanded, setExpanded] = useState(false);
  const isNew = job.status === "Requested";
  const isActive = job.status === "In Progress";

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${isNew ? "border-yellow-200" : "border-slate-100"} p-5 transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
            {HIRING_ICON[job.hiringType] || "🗂"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-800 text-sm">
               {typeof job.serviceId === "object" ? job.serviceId?.name : null || "Service"} — {job.hiringType} Hire
              </p>
              {isNew && (
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {job.employerId?.fullName || "Employer"} · {job.location || "—"}
            </p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-slate-500">📅 {fmt(job.jobDate)}</span>
              {job.estimatedCost > 0 && (
                <span className="text-xs font-semibold text-slate-700">💰 PKR {job.estimatedCost?.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[job.status] || "bg-gray-100 text-gray-500"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[job.status] || "bg-gray-400"}`} />
          {job.status}
        </span>
      </div>

      {job.description && (
        <p className="mt-3 text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3">
          "{job.description}"
        </p>
      )}

      {/* Action Buttons */}
      {(isNew || isActive) && (
        <div className="flex gap-2 mt-4">
          {isNew && (
            <>
              <button
                disabled={loading}
                onClick={() => onAccept(job._id)}
                className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                ✓ Accept
              </button>
              <button
                disabled={loading}
                onClick={() => onReject(job)}
                className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                ✕ Reject
              </button>
            </>
          )}
          {isActive && (
            <button
              disabled={loading}
              onClick={() => onMarkDone(job._id)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              ✓ Mark as Done
            </button>
          )}
          <button
            onClick={() => setExpanded(p => !p)}
            className="ml-auto text-xs text-slate-400 hover:text-slate-600 bg-slate-50 px-3 py-2 rounded-xl"
          >
            {expanded ? "Less ▲" : "Details ▼"}
          </button>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
          {job.hiringType === "Weekly" || job.hiringType === "Monthly" ? (
            <>
              <div><span className="text-slate-400">Start:</span> {fmt(job.startDate)}</div>
              <div><span className="text-slate-400">End:</span> {fmt(job.endDate)}</div>
            </>
          ) : null}
          <div><span className="text-slate-400">Hiring Type:</span> {job.hiringType}</div>
          <div><span className="text-slate-400">Job Date:</span> {fmt(job.jobDate)}</div>
          {job.requestExpiresAt && (
            <div className="col-span-2"><span className="text-slate-400">Expires:</span> {fmt(job.requestExpiresAt)}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkerDashboard() {
  const { jobs, fetchJobs, acceptJob, rejectJob, markDone } = useJobManagement();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("All");
  const [loading, setLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    await fetchJobs();
    try { setProfile(await api.get("/workers/me")); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id) => {
    setLoading(true);
    try { await acceptJob(id); await fetchJobs(); showToast("Job accepted successfully!"); }
    catch (e) { showToast(e.message || "Failed", "error"); }
    finally { setLoading(false); }
  };

  const handleReject = (job) => setRejectTarget(job);

  const handleRejectConfirm = async (reason) => {
    setLoading(true);
    try { await rejectJob(rejectTarget._id, reason); await fetchJobs(); showToast("Job rejected."); }
    catch (e) { showToast(e.message || "Failed", "error"); }
    finally { setLoading(false); setRejectTarget(null); }
  };

  const handleMarkDone = async (id) => {
    setLoading(true);
    try { await markDone(id); await fetchJobs(); showToast("Marked as done!"); }
    catch (e) { showToast(e.message || "Failed", "error"); }
    finally { setLoading(false); }
  };

  const pending = jobs.filter(j => j.status === "Requested");
  const active  = jobs.filter(j => ["Accepted","In Progress","Awaiting Confirmation"].includes(j.status));

  const filtered = jobs.filter(j => {
    if (tab === "All")        return true;
    if (tab === "Pending")    return j.status === "Requested";
    if (tab === "In Progress") return ["Accepted","In Progress","Awaiting Confirmation"].includes(j.status);
    if (tab === "Completed")  return ["Completed","Rejected","Cancelled","Expired"].includes(j.status);
    return true;
  });

  const TAB_COUNT = {
    All:          jobs.length,
    Pending:      jobs.filter(j => j.status === "Requested").length,
    "In Progress": jobs.filter(j => ["Accepted","In Progress","Awaiting Confirmation"].includes(j.status)).length,
    Completed:    jobs.filter(j => ["Completed","Rejected","Cancelled","Expired"].includes(j.status)).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg text-white transition-all ${toast.type === "error" ? "bg-red-500" : "bg-teal-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          job={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/15 flex items-center justify-center text-teal-600 font-black text-xl">
                {(profile?.userId?.fullName || "W").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">{profile?.userId?.fullName || "Worker"}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  📍 {profile?.preferredCity || "—"} · ⭐ {profile?.averageRating?.toFixed(1) || "0.0"} · {profile?.totalCompletedJobs || 0} Jobs
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
  {profile?.services?.map(s => typeof s === "object" ? s.name : "").filter(Boolean).join(", ") || ""}
</p>
              </div>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              profile?.availabilityBadge === "Available"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${profile?.availabilityBadge === "Available" ? "bg-green-500" : "bg-red-400"}`} />
              {profile?.availabilityBadge || "Available"}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
            {[
              { label: "New Requests", value: pending.length, color: "text-yellow-600" },
              { label: "Active Jobs",  value: active.length,  color: "text-indigo-600" },
              { label: "Completed",    value: profile?.totalCompletedJobs || 0, color: "text-green-600" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Requests Banner */}
        {pending.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 flex items-center gap-3">
            <span className="text-yellow-500 text-xl">🔔</span>
            <div>
              <p className="text-sm font-bold text-yellow-800">
                {pending.length} New Request{pending.length > 1 ? "s" : ""} Pending
              </p>
              <p className="text-xs text-yellow-600">Review and respond within 24 hours.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
              {TAB_COUNT[t] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  tab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {TAB_COUNT[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Job List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-500 font-semibold text-sm">No jobs in this category</p>
              <p className="text-slate-400 text-xs mt-1">New requests will appear here</p>
            </div>
          ) : (
            filtered.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onAccept={handleAccept}
                onReject={handleReject}
                onMarkDone={handleMarkDone}
                loading={loading}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}