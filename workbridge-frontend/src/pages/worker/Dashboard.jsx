import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { useJobManagement } from "../../hooks/useJobManagement";
import {
  Clock, Calendar, CalendarDays, CalendarRange,
  MapPin, Star, Briefcase, CheckCircle2, XCircle,
  AlertCircle, Bell, ChevronDown, ChevronUp,
  Banknote, Timer, TrendingUp, User, PlayCircle
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
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
  Hourly:  Clock,
  Daily:   Calendar,
  Weekly:  CalendarDays,
  Monthly: CalendarRange,
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getDurationAndBreakdown(job) {
  const type      = job.hiringType;
  const totalCost = Number(job.estimatedCost) || 0;
  const pricing   = job.servicePricing?.[0] || {};

  if (type === "Hourly") {
    const hourlyRate = Number(pricing.hourlyRate) || 0;
    const hours      = job.quantity || (hourlyRate > 0 && totalCost > 0 ? Math.round(totalCost / hourlyRate) : null);
    const durationLabel = hours ? `${hours} hour${hours > 1 ? "s" : ""}` : null;
    const breakdown = hours
      ? [{ label: `${hours} hour${hours > 1 ? "s" : ""}`, rate: hourlyRate, unit: "hr", cost: totalCost }]
      : null;
    return { durationLabel, breakdown, totalCost };
  }

  if (type === "Daily") {
    const dailyRate = Number(pricing.dailyRate) || 0;
    const days      = job.quantity || (dailyRate > 0 && totalCost > 0 ? Math.round(totalCost / dailyRate) : null);
    const durationLabel = days ? `${days} day${days > 1 ? "s" : ""}` : null;
    const breakdown = days
      ? [{ label: `${days} day${days > 1 ? "s" : ""}`, rate: dailyRate, unit: "day", cost: totalCost }]
      : null;
    return { durationLabel, breakdown, totalCost };
  }

  if ((type === "Weekly" || type === "Monthly") && job.startDate && job.endDate) {
    const s         = new Date(job.startDate);
    const e         = new Date(job.endDate);
    const totalDays = Math.ceil((e - s) / (24 * 3600 * 1000)) + 1;

    const parts = [];
    const months_ = Math.floor(totalDays / 30);
    const remAfterM = totalDays % 30;
    const weeks_  = Math.floor(remAfterM / 7);
    const days_   = remAfterM % 7;
    if (months_ > 0) parts.push(`${months_} month${months_ > 1 ? "s" : ""}`);
    if (weeks_  > 0) parts.push(`${weeks_} week${weeks_ > 1 ? "s" : ""}`);
    if (days_   > 0) parts.push(`${days_} day${days_ > 1 ? "s" : ""}`);
    const durationLabel = parts.join(" + ") || `${totalDays} days`;

    return { durationLabel, breakdown: null, totalCost, totalDays };
  }

  return { durationLabel: null, breakdown: null, totalCost };
}

// ─────────────────────────────────────────────────────────────────────────────
// RejectModal
// ─────────────────────────────────────────────────────────────────────────────
function RejectModal({ job, onClose, onConfirm }) {
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 sm:p-6">
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
          <button onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5">
            <XCircle size={14} /> Cancel
          </button>
          <button onClick={() => onConfirm(reason)}
            className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 flex items-center justify-center gap-1.5">
            <XCircle size={14} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CostBreakdownBox
// ─────────────────────────────────────────────────────────────────────────────
function CostBreakdownBox({ durationLabel, breakdown, totalCost, hiringType, startDate, endDate }) {
  if (!totalCost) return null;

  const isSimple = hiringType === "Hourly" || hiringType === "Daily";
  const unit     = hiringType === "Hourly" ? "hour" : "day";

  return (
    <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 space-y-2.5">

      {durationLabel && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Timer size={10} />
            {durationLabel}
          </div>
          {!isSimple && startDate && endDate && (
            <span className="text-[10px] text-slate-400 font-medium">
              {fmt(startDate)} → {fmt(endDate)}
            </span>
          )}
        </div>
      )}

      {breakdown && breakdown.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <span>
            PKR <span className="font-bold text-slate-700">{Number(breakdown[0].rate).toLocaleString()}</span>
            {" "}per {unit}
            {" · "}
            <span className="font-bold text-slate-700">{breakdown[0].label}</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Banknote size={12} className="text-teal-500" />
          Total Earnings
        </div>
        <span className="text-sm font-black text-teal-600">
          PKR {totalCost.toLocaleString()}
        </span>
      </div>

      <p className="text-[10px] text-slate-400">
        {hiringType} hire · Confirmed on completion
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JobCard
// ─────────────────────────────────────────────────────────────────────────────
function JobCard({ job, onAccept, onReject, onStartJob, onMarkDone, loading }) {
  const [expanded, setExpanded] = useState(false);

  const isNew        = job.status === "Requested";
  const isAccepted   = job.status === "Accepted";
  const isActive     = job.status === "In Progress";
  const jobDatePassed = (() => {
    if (!job.jobDate) return false;
    const today  = new Date(); today.setHours(0, 0, 0, 0);
    const jobDay = new Date(job.jobDate); jobDay.setHours(0, 0, 0, 0);
    return today >= jobDay;
  })();

  const HiringIcon = HIRING_ICON[job.hiringType] || Briefcase;
  const { durationLabel, breakdown, totalCost, totalDays } = getDurationAndBreakdown(job);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all ${isNew ? "border-yellow-200 shadow-yellow-50" : "border-slate-100"} p-4 sm:p-5`}>

      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">

          {/* Icon */}
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${isNew ? "bg-yellow-50 text-yellow-600" : "bg-slate-100 text-slate-500"}`}>
            <HiringIcon size={16} />
          </div>

          <div className="min-w-0 flex-1">

            {/* Title + NEW badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <p className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">
                {typeof job.serviceId === "object" ? job.serviceId?.name : "Service"} — {job.hiringType} Hire
              </p>
              {isNew && (
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                  New
                </span>
              )}
            </div>

            {/* Employer + location */}
            <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-xs text-slate-500 flex-wrap">
              <User size={10} />
              <span className="truncate max-w-[100px] sm:max-w-none">{job.employerId?.fullName || "Employer"}</span>
              {job.description && (
                <>
                  <span className="text-slate-300">·</span>
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-[160px]">{job.description.split("—")[0]?.trim() || "—"}</span>
                </>
              )}
            </div>

            {/* Job date chip */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                <Calendar size={9} />
                {fmt(job.jobDate)}
              </span>
            </div>

            {/* ── Cost breakdown box ── */}
            <CostBreakdownBox
              durationLabel={durationLabel}
              breakdown={breakdown}
              totalCost={totalCost}
              hiringType={job.hiringType}
              startDate={job.startDate}
              endDate={job.endDate}
            />
          </div>
        </div>

        {/* Status badge — hidden label on xs, shown on sm+ */}
        <span className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${STATUS_STYLE[job.status] || "bg-gray-100 text-gray-500"}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[job.status] || "bg-gray-400"}`} />
          <span className="hidden xs:inline sm:inline">{job.status}</span>
        </span>
      </div>

      {/* ── Action buttons ── */}
      {(isNew || isAccepted || isActive) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {isNew && (
            <>
              <button disabled={loading} onClick={() => onAccept(job._id)}
                className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all">
                <CheckCircle2 size={13} /> Accept
              </button>
              <button disabled={loading} onClick={() => onReject(job)}
                className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all">
                <XCircle size={13} /> Reject
              </button>
            </>
          )}
          {isAccepted && (
            <div className="flex flex-col gap-1">
              <button disabled={loading || !jobDatePassed} onClick={() => onStartJob(job._id)}
                className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all">
                <PlayCircle size={13} /> Start Job
              </button>
              {!jobDatePassed && (
                <p className="text-[10px] text-slate-400 text-center">Available on {fmt(job.jobDate)}</p>
              )}
            </div>
          )}
          {isActive && (
            <button disabled={loading} onClick={() => onMarkDone(job._id)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all">
              <CheckCircle2 size={13} /> Mark as Done
            </button>
          )}
          <button onClick={() => setExpanded(p => !p)}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all">
            {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
          </button>
        </div>
      )}

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <HiringIcon size={11} className="text-slate-400 shrink-0" />
            <span className="text-slate-400">Type:</span>
            <span className="font-semibold">{job.hiringType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-slate-400 shrink-0" />
            <span className="text-slate-400">Job Date:</span>
            <span className="font-semibold">{fmt(job.jobDate)}</span>
          </div>

          {["Weekly","Monthly"].includes(job.hiringType) && (
            <>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={11} className="text-slate-400 shrink-0" />
                <span className="text-slate-400">Start:</span>
                <span className="font-semibold">{fmt(job.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={11} className="text-slate-400 shrink-0" />
                <span className="text-slate-400">End:</span>
                <span className="font-semibold">{fmt(job.endDate)}</span>
              </div>
              {totalDays && (
                <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
                  <Timer size={11} className="text-slate-400 shrink-0" />
                  <span className="text-slate-400">Total Duration:</span>
                  <span className="font-semibold text-blue-600">{durationLabel}</span>
                </div>
              )}
            </>
          )}

          {totalCost > 0 && (
            <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
              <Banknote size={11} className="text-teal-500 shrink-0" />
              <span className="text-slate-400">Est. Earnings:</span>
              <span className="font-black text-teal-600">PKR {totalCost.toLocaleString()}</span>
            </div>
          )}

          {job.requestExpiresAt && (
            <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
              <AlertCircle size={11} className="text-orange-400 shrink-0" />
              <span className="text-slate-400">Expires:</span>
              <span className="font-semibold text-orange-600">{fmt(job.requestExpiresAt)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkerDashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function WorkerDashboard() {
  const { jobs, fetchJobs, acceptJob, rejectJob, startJob, markDone } = useJobManagement();
  const [profile, setProfile]           = useState(null);
  const [tab, setTab]                   = useState("All");
  const [loading, setLoading]           = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast]               = useState(null);

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
    try   { await acceptJob(id); await fetchJobs(); showToast("Job accepted successfully!"); }
    catch (e) { showToast(e.message || "Failed", "error"); }
    finally   { setLoading(false); }
  };

  const handleReject = (job) => setRejectTarget(job);

  const handleStartJob = async (id) => {
    setLoading(true);
    try   { await startJob(id); await fetchJobs(); showToast("Job started! Mark as done when finished."); }
    catch (e) { showToast(e.message || "Failed", "error"); }
    finally   { setLoading(false); }
  };

  const handleRejectConfirm = async (reason) => {
    setLoading(true);
    try   { await rejectJob(rejectTarget._id, reason); await fetchJobs(); showToast("Job rejected."); }
    catch (e) { showToast(e.message || "Failed", "error"); }
    finally   { setLoading(false); setRejectTarget(null); }
  };

  const handleMarkDone = async (id) => {
    setLoading(true);
    try   { await markDone(id); await fetchJobs(); showToast("Marked as done!"); }
    catch (e) { showToast(e.message || "Failed", "error"); }
    finally   { setLoading(false); }
  };

  const pending  = jobs.filter(j => j.status === "Requested");
  const active   = jobs.filter(j => ["Accepted","In Progress","Awaiting Confirmation"].includes(j.status));

  const filtered = jobs.filter(j => {
    if (tab === "All")         return true;
    if (tab === "Pending")     return j.status === "Requested";
    if (tab === "In Progress") return ["Accepted","In Progress","Awaiting Confirmation"].includes(j.status);
    if (tab === "Completed")   return ["Completed","Rejected","Cancelled","Expired"].includes(j.status);
    return true;
  });

  const TAB_COUNT = {
    All:           jobs.length,
    Pending:       jobs.filter(j => j.status === "Requested").length,
    "In Progress": jobs.filter(j => ["Accepted","In Progress","Awaiting Confirmation"].includes(j.status)).length,
    Completed:     jobs.filter(j => ["Completed","Rejected","Cancelled","Expired"].includes(j.status)).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 sm:top-5 sm:right-5 z-50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-semibold shadow-lg text-white transition-all flex items-center gap-2 max-w-[calc(100vw-2rem)] ${toast.type === "error" ? "bg-red-500" : "bg-teal-500"}`}>
          {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          <span className="truncate">{toast.msg}</span>
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

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-500/15 flex items-center justify-center text-teal-600 font-black text-lg sm:text-xl shrink-0">
                {(profile?.userId?.fullName || "W").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm sm:text-base truncate">{profile?.userId?.fullName || "Worker"}</p>
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={10} />{profile?.preferredCity || "—"}</span>
                  <span className="flex items-center gap-1"><Star size={10} className="text-amber-400" />{profile?.averageRating?.toFixed(1) || "0.0"}</span>
                  <span className="flex items-center gap-1"><Briefcase size={10} />{jobs.filter(j => j.status === "Completed").length} Jobs</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-none">
                  {profile?.services?.map(s => typeof s === "object" ? s.name : "").filter(Boolean).join(", ") || ""}
                </p>
              </div>
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${
              profile?.availabilityBadge === "Available"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${profile?.availabilityBadge === "Available" ? "bg-green-500" : "bg-red-400"}`} />
              <span className="hidden xs:inline sm:inline">{profile?.availabilityBadge || "Available"}</span>
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100">
            {[
              { label: "New Requests", value: pending.length,                                       color: "text-yellow-600", icon: Bell         },
              { label: "Active Jobs",  value: active.length,                                        color: "text-indigo-600", icon: TrendingUp   },
              { label: "Completed",    value: jobs.filter(j => j.status === "Completed").length,    color: "text-green-600",  icon: CheckCircle2 },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-1">
                  <s.icon size={13} className={s.color} />
                </div>
                <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Requests Banner */}
        {pending.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 sm:px-5 py-3 flex items-start sm:items-center gap-3">
            <Bell size={16} className="text-yellow-500 shrink-0 mt-0.5 sm:mt-0" />
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
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                tab === t ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"
              }`}>
              <span className="truncate">{t}</span>
              {TAB_COUNT[t] > 0 && (
                <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black shrink-0 ${
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
            <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 text-center">
              <Briefcase size={28} className="text-slate-200 mx-auto mb-3" />
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
                onStartJob={handleStartJob}
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