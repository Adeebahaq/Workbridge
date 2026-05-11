import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import SpeakerButton from "../ui/SpeakerButton";
import {
  LayoutGrid,
  FolderKanban,
  MessageCircle,
  User,
  Star,
  CalendarDays,
  Bell,
  Search,
  Briefcase,
  CheckSquare,
  Users,
  BarChart2,
  LogOut,
} from "lucide-react";

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}

const ICON_MAP = {
  "sidebar.my_jobs":        FolderKanban,
  "sidebar.chat":           MessageCircle,
  "sidebar.messages":       MessageCircle,
  "sidebar.profile":        User,
  "sidebar.ratings":        Star,
  "sidebar.availability":   CalendarDays,
  "sidebar.notifications":  Bell,
  "sidebar.dashboard_link": LayoutGrid,
  "sidebar.find_workers":   Search,
  "sidebar.jobs":           Briefcase,
  "sidebar.overview":       LayoutGrid,
  "sidebar.verify_workers": CheckSquare,
  "sidebar.all_workers":    Users,
  "sidebar.job_stats":      BarChart2,
};

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const { t }            = useTranslation();

  const role = user?.role || "worker";
const { unreadCount = 0 } = useNotifications() ?? {};

  const ROLE_CONFIG = {
    worker: {
      labelKey: "sidebar.worker_portal",
      links: [
        { labelKey: "sidebar.my_jobs",       to: "/worker/dashboard"                         },
        { labelKey: "sidebar.chat",           to: "/worker/chat"                              },
        { labelKey: "sidebar.profile",        to: "/worker/profile"                           },
        { labelKey: "sidebar.ratings",        to: "/worker/ratings"                           },
        { labelKey: "sidebar.availability",   to: "/worker/availability"                      },
        { labelKey: "sidebar.notifications",  to: "/worker/notifications", badge: unreadCount },
      ],
    },
    employer: {
      labelKey: "sidebar.employer_portal",
      links: [
        { labelKey: "sidebar.dashboard_link", to: "/employer/dashboard"                        },
        { labelKey: "sidebar.find_workers",   to: "/employer/workers"                          },
        { labelKey: "sidebar.jobs",           to: "/employer/jobs"                             },
        { labelKey: "sidebar.messages",       to: "/employer/chat"                             },
        { labelKey: "sidebar.notifications",  to: "/employer/notifications", badge: unreadCount },
      ],
    },
    admin: {
      labelKey: "sidebar.admin_panel",
      links: [
        { labelKey: "sidebar.overview",       to: "/admin/dashboard" },
        { labelKey: "sidebar.verify_workers", to: "/admin/verify"    },
        { labelKey: "sidebar.all_workers",    to: "/admin/workers"   },
        { labelKey: "sidebar.job_stats",      to: "/admin/stats"     },
      ],
    },
  };

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.worker;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed bottom-6 left-4 z-50 bg-teal-500 text-white p-3 rounded-full shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <LayoutGrid size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50
        w-[230px] shrink-0 min-h-screen h-screen
        bg-[#0F172A] flex flex-col pt-[90px] overflow-hidden
        transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {config.links.map(({ labelKey, to, badge }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            const Icon = ICON_MAP[labelKey];
            return (
              <div key={to} className="flex items-center gap-1">
                <Link
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  {Icon && (
                    <Icon
                      size={17}
                      className={`shrink-0 ${active ? "text-teal-400" : "text-slate-500"}`}
                    />
                  )}
                  <span dir="auto">{t(labelKey)}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {badge > 0 && (
                      <span className="bg-teal-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />}
                  </div>
                </Link>
                <SpeakerButton
                  text={t(labelKey)}
                  className="w-5 h-5 shrink-0 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                />
              </div>
            );
          })}
        </nav>

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
            <LogOut size={15} className="shrink-0" />
            <span dir="auto">{t("sidebar.logout")}</span>
            <SpeakerButton
              textKey="sidebar.logout"
              className="ml-auto w-5 h-5 shrink-0 bg-transparent border-red-900/30 text-red-400 hover:bg-red-500/10"
            />
          </button>
        </div>
      </aside>
    </>
  );
}