// src/components/layout/DashboardLayout.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "./Sidebar";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export default function DashboardLayout({ children }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div dir="ltr" className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div dir="ltr" className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 sticky top-0 z-10">
          <span className="text-sm font-bold text-slate-400">WorkBridge</span>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Home button */}
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 no-underline"
            >
              🏠 <span dir="auto">{t("sidebar.home_link")}</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
            >
              ↪ <span dir="auto">{t("sidebar.logout")}</span>
            </button>
          </div>
        </div>

        <div className="p-3 md:p-6" dir="auto">
          {children}
        </div>
      </main>
    </div>
  );
}