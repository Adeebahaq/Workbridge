import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, Star, XCircle, CheckCircle,
  Briefcase, Clock, TrendingUp, Ban
} from "lucide-react";
import { useJobManagement } from "../../hooks/useJobManagement";
import api from "../../services/api";

const STATUS_META = {
  Requested:               { color: "bg-amber-100 text-amber-700",    dot: "bg-amber-400",    label: "Pending"     },
  Accepted:                { color: "bg-blue-100 text-blue-700",      dot: "bg-blue-400",     label: "Accepted"    },
  "In Progress":           { color: "bg-indigo-100 text-indigo-700",  dot: "bg-indigo-400",   label: "In Progress" },
  "Awaiting Confirmation": { color: "bg-purple-100 text-purple-700",  dot: "bg-purple-400",   label: "Awaiting"    },
  Completed:               { color: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500",  label: "Completed"   },
  Rejected:                { color: "bg-red-100 text-red-700",        dot: "bg-red-500",      label: "Rejected"    },
  Cancelled:               { color: "bg-slate-100 text-slate-500",    dot: "bg-slate-400",    label: "Cancelled"   },
  Expired:                 { color: "bg-orange-100 text-orange-700",  dot: "bg-orange-500",   label: "Expired"     },
};

// ── Rating Modal ────────────────────────────────────────────────────────────
function RateModal({ job, onClose, onRate }) {
  const [rating,     setRating]     = useState(0);
  const [hover,      setHover]      = useState(0);
  const [feedback,   setFeedback]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    setSubmitting(true); setError("");
    try {
      // workerId is extracted inside onRate from the job object
      await onRate(job._id, job.workerId?._id || job.workerId, rating, feedback);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const workerName = job.workerId?.fullName || "Worker";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="font-black text-slate-800 text-lg">Rate {workerName}</h3>
          <p className="text-xs text-slate-400 mt-1">Your review helps others make better decisions.</p>
        </div>

        {/* Stars */}
        <div className="flex gap-1 justify-center mb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className={`text-3xl transition-all ${i <= (hover || rating) ? "text-amber-400 scale-110" : "text-slate-200"}`}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-xs text-slate-500 mb-3 font-semibold">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}

        {/* Feedback */}
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Share your experience (optional, max 300 chars)..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 mb-1"
        />
        <p className="text-[10px] text-slate-400 text-right mb-3">{feedback.length}/300</p>

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rating || submitting}
            className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 rounded-xl text-sm font-black text-white transition-all"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: "all",        label: "All Jobs",    icon: Briefcase   },
  { key: "pending",    label: "Pending",     icon: Clock       },
  { key: "inprogress", label: "In Progress", icon: TrendingUp  },
  { key: "completed",  label: "Completed",   icon: CheckCircle },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function JobRequests() {
  const navigate = useNavigate();
  const { jobs, fetchJobs, cancelJob, confirmJob } = useJobManagement();
  const [tab,     setTab]     = useState("all");
  const [rateJob, setRateJob] = useState(null);
  const [toast,   setToast]   = useState({ show: false, msg: "", type: "success" });
  const [rated,   setRated]   = useState(new Set()); // track already-rated jobs this session

  useEffect(() => { fetchJobs(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const handleCancel = async (id) => {
    try { await cancelJob(id); await fetchJobs(); showToast("Job request cancelled.", "info"); }
    catch (e) { showToast(e.message || "Failed to cancel.", "error"); }
  };

  const handleConfirm = async (id) => {
    try { await confirmJob(id); await fetchJobs(); showToast("✅ Job marked as completed!"); }
    catch (e) { showToast(e.message || "Failed to confirm.", "error"); }
  };

  const handleRate = async (jobId, workerId, rating, feedback) => {
    await api.post("/employers/ratings", { jobId, workerId, stars: rating, feedback });
    setRated(prev => new Set([...prev, jobId]));
    await fetchJobs();
    showToast("⭐ Rating submitted successfully!");
  };

  const filtered = jobs.filter(j => {
    if (tab === "all")        return true;
    if (tab === "pending")    return ["Requested", "Accepted"].includes(j.status);
    if (tab === "inprogress") return ["In Progress", "Awaiting Confirmation"].includes(j.status);
    if (tab === "completed")  return ["Completed", "Rejected", "Cancelled", "Expired"].includes(j.status);
    return true;
  });

  const counts = {
    all:        jobs.length,
    pending:    jobs.filter(j => ["Requested", "Accepted"].includes(j.status)).length,
    inprogress: jobs.filter(j => ["In Progress", "Awaiting Confirmation"].includes(j.status)).length,
    completed:  jobs.filter(j => ["Completed", "Rejected", "Cancelled", "Expired"].includes(j.status)).length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white transition-all ${
          toast.type === "error" ? "bg-red-500" : toast.type === "info" ? "bg-slate-700" : "bg-teal-500"
        }`}>
          {toast.msg}
        </div>
      )}

      {rateJob && (
        <RateModal
          job={rateJob}
          onClose={() => setRateJob(null)}
          onRate={handleRate}
        />
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-teal-500" />
          My Jobs
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Track all your job requests and their status</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 mb-5 shadow-sm w-fit overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                tab === t.key ? "bg-[#0F172A] text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <Briefcase className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-semibold">No jobs here</p>
          <p className="text-sm mt-1">
            {tab === "all" ? "You haven't sent any job requests yet." : "No jobs in this category."}
          </p>
        </div>
      )}

      {/* Job Cards */}
      <div className="space-y-3">
        {filtered.map(j => {
          const meta        = STATUS_META[j.status] || STATUS_META["Expired"];
          const workerName  = typeof j.workerId === "object" ? (j.workerId?.fullName || "Worker") : "Worker";
          const workerInit  = workerName.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
          const svcName     = j.serviceId?.name || "Service";
          const cost        = j.estimatedCost;
          const canChat     = ["Accepted", "In Progress", "Awaiting Confirmation"].includes(j.status);
          const canRate     = j.status === "Completed" && !rated.has(j._id);
          const canConfirm  = j.status === "Awaiting Confirmation";
          const canCancel   = j.status === "Requested";

          return (
            <div key={j._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">
                  {workerInit}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-slate-800 text-sm">{workerName}</p>
                      <p className="text-xs text-slate-400">
                        {svcName} · {j.hiringType} · {fmtDate(j.jobDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {cost > 0 && (
                        <p className="font-black text-slate-800 text-sm">PKR {cost.toLocaleString()}</p>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {j.description && (
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                      {j.description}
                    </p>
                  )}

                  {/* Rejection reason */}
                  {j.status === "Rejected" && j.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1.5 bg-red-50 px-3 py-1.5 rounded-lg">
                      Reason: {j.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(canCancel || canConfirm || canChat || canRate) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50 flex-wrap">
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(j._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                  {canConfirm && (
                    <button
                      onClick={() => handleConfirm(j._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-black transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Confirm Done
                    </button>
                  )}
                  {canChat && (
                    <button
                      onClick={() => navigate(`/employer/chat/${j._id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                    </button>
                  )}
                  {canRate && (
                    <button
                      onClick={() => setRateJob(j)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-bold transition-all"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Rate Worker
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}