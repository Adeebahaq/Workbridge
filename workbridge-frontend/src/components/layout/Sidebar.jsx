import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import SpeakerButton from "../ui/SpeakerButton";

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const role = user?.role || "worker";

  const ROLE_CONFIG = {
    worker: {
      labelKey: "sidebar.worker_portal",
      links: [
        { labelKey: "sidebar.my_jobs",       icon: "🗂",  to: "/worker/dashboard" },
        { labelKey: "sidebar.chat",          icon: "💬",  to: "/worker/chat" },
        { labelKey: "sidebar.profile",       icon: "👤",  to: "/worker/profile" },
        { labelKey: "sidebar.availability",  icon: "📅",  to: "/worker/availability" },
        { labelKey: "sidebar.notifications", icon: "🔔",  to: "/worker/notifications" },
      ],
    },
    employer: {
      labelKey: "sidebar.employer_portal",
      links: [
        { labelKey: "sidebar.dashboard_link", icon: "⊞",  to: "/employer/workers" },
        { labelKey: "sidebar.jobs",           icon: "🗂",  to: "/employer/jobs" },
        { labelKey: "sidebar.messages",       icon: "💬",  to: "/employer/messages" },
        { labelKey: "sidebar.notifications",  icon: "🔔",  to: "/employer/notifications" },
      ],
    },
    admin: {
      labelKey: "sidebar.admin_panel",
      links: [
        { labelKey: "sidebar.overview",       icon: "⊞",  to: "/admin/dashboard" },
        { labelKey: "sidebar.verify_workers", icon: "✅",  to: "/admin/verify" },
        { labelKey: "sidebar.all_workers",    icon: "👥",  to: "/admin/workers" },
        { labelKey: "sidebar.job_stats",      icon: "📊",  to: "/admin/stats" },
      ],
    },
  };

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.worker;

  return (
    <aside className="w-[230px] shrink-0 min-h-screen bg-[#0F172A] flex flex-col pt-[90px]">
      
  

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {config.links.map(({ labelKey, icon, to }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <div key={to} className="flex items-center gap-1">
              <Link
                to={to}
                className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="text-base w-5 text-center shrink-0">{icon}</span>
                <span dir="auto">{t(labelKey)}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />}
              </Link>
              <SpeakerButton
                text={t(labelKey)}
                className="w-5 h-5 shrink-0 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
              />
            </div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xs shrink-0">
            {initials(user?.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-slate-200 font-semibold text-xs truncate">{user?.fullName || "User"}</div>
            <div className="text-slate-500 text-[10px] capitalize" dir="auto">{role}</div>
          </div>
          <SpeakerButton
            text={`${user?.fullName || "User"}, ${role}`}
            className="w-5 h-5 shrink-0 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
          />
        </div>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-xs font-bold border-none cursor-pointer bg-transparent"
        >
          <span className="shrink-0">↪</span>
          <span dir="auto">{t("sidebar.logout")}</span>
          <SpeakerButton
            textKey="sidebar.logout"
            className="ml-auto w-5 h-5 shrink-0 bg-transparent border-red-900/30 text-red-400 hover:bg-red-500/10"
          />
        </button>
      </div>
    </aside>
  );
}