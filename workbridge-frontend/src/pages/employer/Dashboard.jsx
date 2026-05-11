import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Briefcase, MessageSquare, Bell,
  Star, CheckCircle, Clock, XCircle, TrendingUp, Users
} from "lucide-react";
import api from "../../services/api";
import { useJobManagement } from "../../hooks/useJobManagement";
import { useAuth } from "../../hooks/useAuth";

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_META = {
  Requested:               { dot: "bg-amber-400",   label: "Pending",    text: "text-amber-700",   bg: "bg-amber-50" },
  Accepted:                { dot: "bg-blue-400",    label: "Accepted",   text: "text-blue-700",    bg: "bg-blue-50" },
  "In Progress":           { dot: "bg-indigo-400",  label: "In Progress",text: "text-indigo-700",  bg: "bg-indigo-50" },
  "Awaiting Confirmation": { dot: "bg-purple-400",  label: "Awaiting",   text: "text-purple-700",  bg: "bg-purple-50" },
  Completed:               { dot: "bg-emerald-500", label: "Completed",  text: "text-emerald-700", bg: "bg-emerald-50" },
  Rejected:                { dot: "bg-red-400",     label: "Rejected",   text: "text-red-600",     bg: "bg-red-50" },
  Cancelled:               { dot: "bg-slate-400",   label: "Cancelled",  text: "text-slate-600",   bg: "bg-slate-100" },
  Expired:                 { dot: "bg-orange-400",  label: "Expired",    text: "text-orange-600",  bg: "bg-orange-50" },
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { jobs, fetchJobs } = useJobManagement();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    fetchJobs();
      api.get("/employers/notifications")
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoadingNotifs(false));
  }, []);

  const totalJobs      = jobs.length;
  const activeJobs     = jobs.filter(j => ["Accepted", "In Progress", "Awaiting Confirmation"].includes(j.status)).length;
  const completedJobs  = jobs.filter(j => j.status === "Completed").length;
  const pendingJobs    = jobs.filter(j => j.status === "Requested").length;
  const unreadNotifs   = notifications.filter(n => !n.isRead).length;

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Welcome Banner */}
      <div className="bg-[#0F172A] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm font-semibold">Good day,</p>
          <h1 className="text-2xl font-black mt-0.5">
            {firstName} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {activeJobs > 0
              ? `You have ${activeJobs} active job${activeJobs > 1 ? "s" : ""} in progress.`
              : "Find a worker to get started."}
          </p>
        </div>
        <Link
          to="/employer/workers"
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-black px-5 py-3 rounded-xl text-sm transition-all shrink-0"
        >
          <Search className="w-4 h-4" />
          Find Workers
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Briefcase}    label="Total Jobs"      value={totalJobs}    color="bg-slate-100 text-slate-600" />
        <StatCard icon={Clock}        label="Pending"         value={pendingJobs}  color="bg-amber-100 text-amber-600" />
        <StatCard icon={TrendingUp}   label="Active Jobs"     value={activeJobs}   color="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle}  label="Completed"       value={completedJobs} color="bg-emerald-100 text-emerald-600" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/employer/workers",       icon: Search,       label: "Find Workers",    desc: "Browse & hire",     color: "text-teal-600",  bg: "bg-teal-50" },
          { to: "/employer/jobs",          icon: Briefcase,    label: "My Jobs",         desc: "Track requests",    color: "text-blue-600",  bg: "bg-blue-50" },
          { to: "/employer/chat",          icon: MessageSquare,label: "Messages",        desc: "Chat with workers", color: "text-indigo-600",bg: "bg-indigo-50" },
          { to: "/employer/notifications", icon: Bell,         label: "Notifications",   desc: unreadNotifs > 0 ? `${unreadNotifs} unread` : "All caught up", color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ to, icon: Icon, label, desc, color, bg }) => (
          <Link key={to} to={to}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all flex flex-col gap-3 no-underline"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-black text-slate-800">Recent Job Requests</h2>
          <Link to="/employer/jobs" className="text-xs font-bold text-teal-600 hover:text-teal-500 no-underline">
            View All →
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Briefcase className="w-8 h-8 mb-3 opacity-40" />
            <p className="font-semibold text-sm">No jobs yet</p>
            <p className="text-xs mt-1">
              <Link to="/employer/workers" className="text-teal-600 no-underline font-bold">Find a worker</Link> to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentJobs.map(job => {
              const meta = STATUS_META[job.status] || STATUS_META["Expired"];
              const workerName = job.workerId?.fullName || "Worker";
              const initials = workerName.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
              return (
                <div key={job._id} className="flex items-center gap-3 px-3 sm:px-5 py-3.5 flex-wrap sm:flex-nowrap">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 font-black text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{workerName}</p>
                    <p className="text-xs text-slate-400">
                      {job.serviceId?.name || "Service"} · {job.hiringType} · {fmtDate(job.jobDate)}
                    </p>
                  </div>
                  {job.estimatedCost > 0 && (
                    <p className="font-black text-slate-700 text-sm shrink-0">
                      PKR {job.estimatedCost.toLocaleString()}
                    </p>
                  )}
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${meta.bg} ${meta.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}