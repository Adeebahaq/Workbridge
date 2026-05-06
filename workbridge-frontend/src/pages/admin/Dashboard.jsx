import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import AdminCreateWorker from "../../components/admin/AdminCreateWorker";

// ─── helpers ────────────────────────────────────────────────────────────────
const STATUS_META = {
  "Active":               { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Active" },
  "Pending Verification": { color: "bg-amber-100  text-amber-700",    dot: "bg-amber-400",   label: "Pending" },
  "Rejected":             { color: "bg-red-100    text-red-700",      dot: "bg-red-500",     label: "Rejected" },
  "Suspended":            { color: "bg-orange-100 text-orange-700",   dot: "bg-orange-500",  label: "Suspended" },
  "Inactive":             { color: "bg-slate-100  text-slate-500",    dot: "bg-slate-400",   label: "Inactive" },
};

const JOB_STATUS_COLORS = {
  requested:             "#F59E0B",
  accepted:              "#3B82F6",
  inProgress:            "#6366F1",
  awaitingConfirmation:  "#A855F7",
  completed:             "#10B981",
  rejected:              "#EF4444",
  cancelled:             "#94A3B8",
  expired:               "#F97316",
};

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}
function relTime(d) {
  if (!d) return "—";
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Donut Chart (pure SVG) ───────────────────────────────────────────────
function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center w-40 h-40 rounded-full border-8 border-slate-100 text-slate-400 text-xs font-semibold">
      No Data
    </div>
  );

  const entries = Object.entries(data).filter(([, v]) => v > 0);
  let cumulative = 0;
  const segments = entries.map(([key, value]) => {
    const pct = value / total;
    const seg = { key, value, pct, start: cumulative };
    cumulative += pct;
    return seg;
  });

  const r = 60, cx = 70, cy = 70, strokeW = 18;
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40 -rotate-90">
      {segments.map(({ key, pct, start }) => (
        <circle
          key={key}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={JOB_STATUS_COLORS[key] || "#94A3B8"}
          strokeWidth={strokeW}
          strokeDasharray={`${pct * circumference} ${circumference}`}
          strokeDashoffset={-start * circumference}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      ))}
    </svg>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────
function BarChart({ data }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const labels = {
    requested: "Req", accepted: "Acc", inProgress: "Prog",
    awaitingConfirmation: "Wait", completed: "Done",
    rejected: "Rej", cancelled: "Canc", expired: "Exp",
  };
  return (
    <div className="flex items-end gap-2 h-32 mt-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-500">{val > 0 ? val : ""}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-700"
            style={{
              height: `${Math.max((val / max) * 100, val > 0 ? 8 : 0)}%`,
              backgroundColor: JOB_STATUS_COLORS[key] || "#94A3B8",
              minHeight: val > 0 ? "6px" : "2px",
              opacity: val > 0 ? 1 : 0.2,
            }}
          />
          <span className="text-[9px] text-slate-400 font-semibold truncate w-full text-center">{labels[key]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Worker Review Modal ─────────────────────────────────────────────────
function ReviewModal({ worker, onClose, onAction }) {
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);

  const handle = async (action) => {
    if (action === "reject" && rejectReason.trim().length < 20) {
      alert("Rejection reason must be at least 20 characters.");
      return;
    }
    setLoading(true);
    await onAction(action, worker._id, rejectReason);
    setLoading(false);
  };

  const isPending = worker.status === "Pending Verification";
  const isActive  = worker.status === "Active";
  const meta = STATUS_META[worker.status] || STATUS_META["Inactive"];
  const name = worker.userId?.fullName || "Unknown";
  const charCount = rejectReason.trim().length;
  const rejectReady = charCount >= 20;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F172A] p-6 text-white rounded-t-2xl shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Worker Review</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">✕</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xl">
              {initials(name)}
            </div>
            <div>
              <h2 className="text-xl font-black">{name}</h2>
              <p className="text-slate-400 text-sm">{worker.userId?.phone} · {worker.preferredCity}</p>
              <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${meta.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0">
          {["info", "services", "documents"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-xs font-bold capitalize transition-all ${activeTab === t ? "border-b-2 border-teal-500 text-teal-600" : "text-slate-400 hover:text-slate-600"}`}>
              {t === "info" ? "Personal Info" : t === "services" ? "Services & Availability" : "Documents"}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "info" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Full Name",       name],
                ["Phone",           worker.userId?.phone],
                ["CNIC",            worker.cnicNumber],
                ["Gender",          worker.gender],
                ["Date of Birth",   fmt(worker.dateOfBirth)],
                ["Marital Status",  worker.maritalStatus],
                ["Father/Spouse",   worker.fatherSpouseName],
                ["Current Address", worker.currentAddress],
                ["Preferred City",  worker.preferredCity],
                ["Employment Type", worker.employmentType],
                ["Submitted",       fmt(worker.submittedAt)],
                ["Max Travel",      worker.maxTravelDistance ? `${worker.maxTravelDistance} km` : "—"],
              ].map(([label, val]) => (
                <div key={label} className={label === "Current Address" ? "col-span-2" : ""}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl px-3 py-2">{val || "—"}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {(worker.services || []).map(s => (
                    <span key={s._id || s} className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-200">
                      {s.name || s}
                    </span>
                  ))}
                  {(!worker.services || worker.services.length === 0) && <span className="text-slate-400 text-sm">No services listed</span>}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Days</p>
                <div className="flex flex-wrap gap-2">
                  {(worker.daysAvailable || []).map(d => (
                    <span key={d} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preferred Working Hours</p>
                <div className="flex flex-wrap gap-2">
                  {(worker.preferredWorkingHours || []).map(h => (
                    <span key={h} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">{h}</span>
                  ))}
                  {(!worker.preferredWorkingHours || worker.preferredWorkingHours.length === 0) && (
                    <span className="text-slate-400 text-sm">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              {worker.cnicFrontImage?.url ? (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CNIC Front</p>
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/${worker.cnicFrontImage.url}`}
                    alt="CNIC Front"
                    className="w-full rounded-2xl border border-slate-200 object-cover max-h-48"
                    onError={e => { e.target.style.display = "none"; }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-4xl mb-2">📄</p>
                  <p className="text-sm text-slate-400 font-semibold">No CNIC image uploaded</p>
                </div>
              )}
              {worker.adminRejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-700 mb-1">Previous Rejection Reason</p>
                  <p className="text-sm text-red-600">{worker.adminRejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions footer — always visible */}
        <div className="shrink-0 p-5 border-t border-slate-100 bg-slate-50 space-y-3 rounded-b-2xl">
          {isPending && (
            <>
              <div>
                <textarea
                  rows={2}
                  placeholder="Rejection reason (min 20 chars, required for reject only)"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                <div className="flex justify-between items-center mt-1 px-1">
                  <span className={`text-xs font-semibold ${rejectReady ? "text-green-600" : "text-red-500"}`}>
                    {rejectReady
                      ? "✓ Ready to reject"
                      : `${20 - charCount} more characters needed to enable Reject`}
                  </span>
                  <span className="text-xs text-slate-400">{charCount}/20</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handle("approve")} disabled={loading}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                  {loading ? "..." : "✓ Approve"}
                </button>
                <button onClick={() => handle("reject")} disabled={loading || !rejectReady}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                  ✕ Reject
                </button>
              </div>
            </>
          )}
          {isActive && (
            <button onClick={() => handle("suspend")} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
              🔒 Suspend Worker
            </button>
          )}
          {worker.status === "Suspended" && (
            <button onClick={() => handle("activate")} disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
              🔓 Reactivate Worker
            </button>
          )}
          {worker.status === "Rejected" && (
            <button onClick={() => handle("approve")} disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
              ↩ Approve Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Worker Card (All Workers grid) ─────────────────────────────────────
function WorkerCard({ worker, onReview }) {
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
          <p className="text-xs text-slate-400 mt-0.5">{worker.userId?.phone}</p>
          <p className="text-xs text-slate-500 mt-0.5">📍 {worker.preferredCity}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {services.map(s => (
              <span key={s._id || s} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {s.name || s}
              </span>
            ))}
            {worker.services?.length > 2 && (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                +{worker.services.length - 2}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-slate-400">{relTime(worker.submittedAt)}</span>
            <button onClick={() => onReview(worker)}
              className="text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition-all">
              Review →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Row ─────────────────────────────────────────────────────────
function PendingRow({ worker, onReview }) {
  const name = worker.userId?.fullName || "Unknown";
  const services = (worker.services || []).slice(0, 2);
  const days = Math.floor((Date.now() - new Date(worker.submittedAt)) / 86400000);

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-amber-200 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm shrink-0">
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-xs text-slate-400">{worker.userId?.phone}</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {services.map(s => (
          <span key={s._id || s} className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
            {s.name || s}
          </span>
        ))}
      </div>
      <div className="text-center shrink-0">
        <p className="text-xs font-bold text-slate-500">📍 {worker.preferredCity}</p>
      </div>
      <div className="text-center shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${days === 0 ? "bg-blue-100 text-blue-600" : days <= 1 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
          {days === 0 ? "New today" : `${days}d waiting`}
        </span>
      </div>
      <button onClick={() => onReview(worker)}
        className="shrink-0 bg-[#0F172A] hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
        Review →
      </button>
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview",       icon: "⊞" },
  { id: "verify",   label: "Verify Workers", icon: "✅" },
  { id: "all",      label: "All Workers",    icon: "👥" },
  { id: "stats",    label: "Job Stats",      icon: "📊" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]                   = useState("overview");
  const [metrics, setMetrics]           = useState(null);
  const [pending, setPending]           = useState([]);
  const [allWorkers, setAll]            = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected]         = useState(null);
  const [toast, setToast]               = useState(null);
  const [workerSearch, setWorkerSearch] = useState("");
  const [dataLoading, setDataLoading]   = useState(true);
  const [createModal, setCreateModal]   = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setDataLoading(true);
    try {
      const [m, p, a] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/workers/pending"),
        api.get("/admin/workers/all"),
      ]);
      setMetrics(m);
      setPending(Array.isArray(p) ? p : []);
      setAll(Array.isArray(a) ? a : []);
    } catch (e) {
      showToast(e.message || "Failed to load data", "error");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchFiltered = async (status) => {
    setFilterStatus(status);
    try {
      const url = status ? `/admin/workers/all?status=${encodeURIComponent(status)}` : "/admin/workers/all";
      const a = await api.get(url);
      setAll(Array.isArray(a) ? a : []);
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleAction = async (action, workerId, reason) => {
    try {
      if (action === "approve") {
        await api.patch(`/admin/workers/${workerId}/approve`);
        showToast("Worker approved successfully!");
      } else if (action === "reject") {
        await api.patch(`/admin/workers/${workerId}/reject`, { reason });
        showToast("Worker rejected.");
      } else if (action === "suspend") {
        await api.patch(`/admin/workers/${workerId}/suspend`);
        showToast("Worker suspended.");
      } else if (action === "activate") {
        await api.patch(`/admin/workers/${workerId}/activate`);
        showToast("Worker reactivated!");
      }
      setSelected(null);
      fetchAll();
    } catch (e) {
      showToast(e.message || "Action failed", "error");
    }
  };

  const visibleWorkers = allWorkers.filter(w => {
    if (workerSearch) {
      const q     = workerSearch.toLowerCase();
      const name  = (w.userId?.fullName || "").toLowerCase();
      const phone = (w.userId?.phone    || "").toLowerCase();
      const city  = (w.preferredCity    || "").toLowerCase();
      if (!name.includes(q) && !phone.includes(q) && !city.includes(q)) return false;
    }
    return true;
  });

  const jobData    = metrics?.todayJobActivity  || {};
  const allJobData = metrics?.allTimeJobActivity || {};

  const StatSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-200 mb-3" />
      <div className="h-7 w-12 bg-slate-200 rounded mb-1" />
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 mt-14">

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white ${toast.type === "error" ? "bg-red-500" : "bg-teal-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Review Modal ────────────────────────────────────────────────────── */}
      {selected && (
        <ReviewModal worker={selected} onClose={() => setSelected(null)} onAction={handleAction} />
      )}

      {/* ── Create Worker Modal (fixed enums — uses AdminCreateWorker) ──────── */}
      {createModal && (
        <AdminCreateWorker
          onClose={() => setCreateModal(false)}
          onSuccess={(msg) => { showToast(msg); fetchAll(); }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-[#0F172A] flex flex-col min-h-screen fixed left-0 top-0 z-30">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-black text-sm">W</div>
            <span className="font-black text-white text-base">Work<span className="text-teal-400">Bridge</span></span>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {TABS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                tab === id ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}>
              <span className="text-base">{icon}</span>
              <span>{label}</span>
              {tab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />}
              {id === "verify" && pending.length > 0 && (
                <span className="ml-auto text-[10px] font-black bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xs shrink-0">
              {initials(user?.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 font-semibold text-xs truncate">{user?.fullName || "Admin"}</p>
              <p className="text-slate-500 text-[10px]">Administrator</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-bold border-none cursor-pointer bg-transparent transition-all">
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 ml-56 p-6 min-h-screen">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-800">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Platform overview and key metrics</p>
              </div>
              <button
                onClick={() => setCreateModal(true)}
                className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
              >
                + Create Worker Account
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {dataLoading ? (
                [1, 2, 3, 4].map(i => <StatSkeleton key={i} />)
              ) : (
                [
                  { label: "Total Workers",   val: metrics?.totalWorkers         ?? "—", icon: "🧑‍🔧", color: "bg-blue-50 text-blue-600" },
                  { label: "Total Employers", val: metrics?.totalEmployers       ?? "—", icon: "🏢",  color: "bg-purple-50 text-purple-600" },
                  { label: "Active Workers",  val: metrics?.activeWorkers        ?? "—", icon: "✅",  color: "bg-emerald-50 text-emerald-600" },
                  { label: "Pending Review",  val: metrics?.pendingVerifications ?? "—", icon: "⏳",  color: "bg-amber-50 text-amber-600" },
                ].map(({ label, val, icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl mb-3`}>{icon}</div>
                    <p className="text-2xl font-black text-slate-800">{val}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Donut */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-800 mb-4">Today's Job Activity</h3>
                <div className="flex items-center gap-6">
                  <div className="relative shrink-0">
                    <DonutChart data={jobData} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-800">
                          {dataLoading ? "…" : Object.values(jobData).reduce((a, b) => a + b, 0)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    {dataLoading ? (
                      <div className="space-y-2 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-3 bg-slate-100 rounded w-full" />)}
                      </div>
                    ) : (
                      <>
                        {Object.entries(jobData).filter(([, v]) => v > 0).map(([key, val]) => {
                          const total = Object.values(jobData).reduce((a, b) => a + b, 0) || 1;
                          const labels = {
                            requested: "Requested", accepted: "Accepted", inProgress: "In Progress",
                            awaitingConfirmation: "Awaiting", completed: "Completed",
                            rejected: "Rejected", cancelled: "Cancelled", expired: "Expired",
                          };
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: JOB_STATUS_COLORS[key] }} />
                              <span className="text-xs text-slate-500 flex-1">{labels[key]}</span>
                              <span className="text-xs font-black text-slate-700">{val}</span>
                              <span className="text-[10px] text-slate-400 w-8 text-right">{Math.round(val / total * 100)}%</span>
                            </div>
                          );
                        })}
                        {Object.values(jobData).every(v => v === 0) && (
                          <p className="text-sm text-slate-400">No jobs today yet</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending quick list */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800">Pending Verifications</h3>
                  {pending.length > 0 && (
                    <button onClick={() => setTab("verify")} className="text-xs font-bold text-teal-600 hover:underline">View all</button>
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
                    <p className="text-3xl mb-2">🎉</p>
                    <p className="text-sm text-slate-400 font-semibold">All caught up!</p>
                    <p className="text-xs text-slate-400">No pending verifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pending.slice(0, 4).map(w => (
                      <div key={w._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all" onClick={() => setSelected(w)}>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                          {initials(w.userId?.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{w.userId?.fullName}</p>
                          <p className="text-xs text-slate-400">{w.preferredCity}</p>
                        </div>
                        <span className="text-xs font-bold text-teal-600">Review →</span>
                      </div>
                    ))}
                    {pending.length > 4 && (
                      <button onClick={() => setTab("verify")} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-1 transition-all">
                        +{pending.length - 4} more pending
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VERIFY WORKERS */}
        {tab === "verify" && (
          <div className="max-w-4xl space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Verify Workers</h1>
              <p className="text-sm text-slate-400">Review and approve pending worker profiles</p>
            </div>
            {dataLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-2 bg-slate-100 rounded w-1/4" />
                    </div>
                    <div className="w-20 h-8 bg-slate-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
                <p className="text-5xl mb-4">🎉</p>
                <p className="font-black text-slate-700 text-base mb-1">No pending verifications</p>
                <p className="text-slate-400 text-sm">All worker submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(w => (
                  <PendingRow key={w._id} worker={w} onReview={setSelected} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL WORKERS */}
        {tab === "all" && (
          <div className="max-w-5xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-800">All Workers</h1>
                <p className="text-sm text-slate-400">Browse all registered workers on the platform</p>
              </div>
              <input
                type="text"
                placeholder="Search name, phone, city..."
                value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 w-52"
              />
            </div>

            <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 w-fit">
              {[
                { val: "",                     label: "All" },
                { val: "Active",               label: "Active" },
                { val: "Pending Verification", label: "Pending" },
                { val: "Rejected",             label: "Rejected" },
                { val: "Suspended",            label: "Suspended" },
              ].map(({ val, label }) => {
                const count = val === "" ? allWorkers.length : allWorkers.filter(w => w.status === val).length;
                return (
                  <button key={val} onClick={() => fetchFiltered(val)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
                <p className="text-4xl mb-3">👷</p>
                <p className="text-slate-500 font-semibold text-sm">No workers found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleWorkers.map(w => (
                  <WorkerCard key={w._id} worker={w} onReview={setSelected} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* JOB STATS */}
        {tab === "stats" && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Job Stats</h1>
              <p className="text-sm text-slate-400">Platform-wide job activity and trends</p>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {dataLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 mx-auto mb-2" />
                    <div className="h-7 w-8 bg-slate-200 rounded mx-auto mb-1" />
                    <div className="h-2 w-16 bg-slate-100 rounded mx-auto" />
                  </div>
                ))
              ) : (
                [
                  { key: "requested",  label: "Requested",   icon: "📩" },
                  { key: "accepted",   label: "Accepted",    icon: "✅" },
                  { key: "inProgress", label: "In Progress", icon: "🔄" },
                  { key: "completed",  label: "Completed",   icon: "🏁" },
                  { key: "rejected",   label: "Rejected",    icon: "❌" },
                ].map(({ key, label, icon }) => (
                  <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2"
                      style={{ backgroundColor: JOB_STATUS_COLORS[key] + "20" }}>
                      {icon}
                    </div>
                    <p className="text-2xl font-black text-slate-800">{allJobData[key] ?? 0}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">{label}</p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
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

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
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
        )}

      </main>
    </div>
  );
}