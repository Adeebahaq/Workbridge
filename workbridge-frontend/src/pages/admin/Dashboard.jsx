import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import AdminCreateWorker from "../../components/admin/AdminCreateWorker";
import { CheckCircle, Users, BarChart2, Wrench, Building2, UserCheck, Clock, XCircle, CheckCircle2, LayoutGrid, ShieldCheck } from "lucide-react";

import ReviewModal from "./ReviewModal";
import OverviewTab from "./Overview";
import VerifyTab from "./Verify";
import AllWorkersTab from "./AllWorkers";
import StatsTab from "./Stats";

export const STATUS_META = {
  "Active":               { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Active" },
  "Pending Verification": { color: "bg-amber-100  text-amber-700",    dot: "bg-amber-400",   label: "Pending" },
  "Rejected":             { color: "bg-red-100    text-red-700",      dot: "bg-red-500",     label: "Rejected" },
  "Suspended":            { color: "bg-orange-100 text-orange-700",   dot: "bg-orange-500",  label: "Suspended" },
  "Inactive":             { color: "bg-slate-100  text-slate-500",    dot: "bg-slate-400",   label: "Inactive" },
};

export const JOB_STATUS_COLORS = {
  requested:            "#F59E0B",
  accepted:             "#3B82F6",
  inProgress:           "#6366F1",
  awaitingConfirmation: "#A855F7",
  completed:            "#10B981",
  rejected:             "#EF4444",
  cancelled:            "#94A3B8",
  expired:              "#F97316",
};

export function initials(name = "") {
  return name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}
export function relTime(d) {
  if (!d) return "—";
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}
export function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

const TABS = [
  { id: "overview", label: "Overview",       Icon: LayoutGrid },
  { id: "verify",   label: "Verify Workers", Icon: ShieldCheck },
  { id: "all",      label: "All Workers",    Icon: Users },
  { id: "stats",    label: "Job Stats",      Icon: BarChart2 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tab = {
    "/admin/dashboard": "overview",
    "/admin/verify":    "verify",
    "/admin/workers":   "all",
    "/admin/stats":     "stats",
  }[pathname] || "overview";

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
      if (action === "approve")  await api.patch(`/admin/workers/${workerId}/approve`),  showToast("Worker approved successfully!");
      if (action === "reject")   await api.patch(`/admin/workers/${workerId}/reject`, { reason }), showToast("Worker rejected.");
      if (action === "suspend")  await api.patch(`/admin/workers/${workerId}/suspend`),  showToast("Worker suspended.");
      if (action === "activate") await api.patch(`/admin/workers/${workerId}/activate`), showToast("Worker reactivated!");
      setSelected(null);
      fetchAll();
    } catch (e) {
      showToast(e.message || "Action failed", "error");
    }
  };

  const visibleWorkers = allWorkers.filter(w => {
    if (!workerSearch) return true;
    const q = workerSearch.toLowerCase();
    return (
      (w.userId?.fullName  || "").toLowerCase().includes(q) ||
      (w.userId?.phone     || "").toLowerCase().includes(q) ||
      (w.preferredCity     || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white flex items-center gap-2 ${toast.type === "error" ? "bg-red-500" : "bg-teal-500"}`}>
          {toast.type === "error" ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {selected && (
        <ReviewModal worker={selected} onClose={() => setSelected(null)} onAction={handleAction} />
      )}

      {createModal && (
        <AdminCreateWorker
          onClose={() => setCreateModal(false)}
          onSuccess={(msg) => { showToast(msg); fetchAll(); }}
        />
      )}

      <main className="flex-1 p-3 sm:p-6 min-h-screen w-full min-w-0">
        {tab === "overview" && (
          <OverviewTab
            metrics={metrics}
            pending={pending}
            dataLoading={dataLoading}
            jobData={metrics?.todayJobActivity || {}}
            onSelectWorker={setSelected}
            onCreateWorker={() => setCreateModal(true)}
            navigate={navigate}
          />
        )}
        {tab === "verify" && (
          <VerifyTab
            pending={pending}
            dataLoading={dataLoading}
            onSelectWorker={setSelected}
          />
        )}
        {tab === "all" && (
          <AllWorkersTab
            allWorkers={allWorkers}
            visibleWorkers={visibleWorkers}
            filterStatus={filterStatus}
            workerSearch={workerSearch}
            dataLoading={dataLoading}
            onSearch={setWorkerSearch}
            onFilter={fetchFiltered}
            onSelectWorker={setSelected}
          />
        )}
        {tab === "stats" && (
          <StatsTab
            metrics={metrics}
            dataLoading={dataLoading}
            jobData={metrics?.todayJobActivity || {}}
            allJobData={metrics?.allTimeJobActivity || {}}
          />
        )}
      </main>
    </div>
  );
}