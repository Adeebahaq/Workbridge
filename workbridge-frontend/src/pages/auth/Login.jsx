import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import SpeakerButton from "../../components/ui/SpeakerButton";
import api from "../../services/api";
import { Briefcase, AlertCircle } from "lucide-react";

const ROLE_REDIRECT = {
  admin:    "/admin/dashboard",
  worker:   "/worker/dashboard",
  employer: "/employer/workers",
};

// ── Phone formatter: 0300-1234567 ──────────────────────────────────────────
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export default function Login() {
  const [form, setForm]                       = useState({ phone: "", password: "" });
  const [error, setError]                     = useState("");
  const [unverifiedPhone, setUnverifiedPhone] = useState("");
  const [loading, setLoading]                 = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setUnverifiedPhone(""); setLoading(true);
    try {
      const { token, role, fullName } = await api.post("/auth/login", form);
      let extraData = { fullName };
      try {
        const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        extraData = { ...extraData, ...me };
      } catch { /* ignore */ }
      login(token, extraData);
      navigate(ROLE_REDIRECT[role] || "/", { replace: true });
    } catch (err) {
      if (err.statusCode === 403) setUnverifiedPhone(form.phone);
      setError(err.message || t("login.error_default"));
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setError("");
    try {
      await api.post("/auth/resend-otp", { phone: unverifiedPhone });
      alert("OTP sent! Check your WhatsApp (or server console in dev mode).");
    } catch (err) { setError(err.message || "Failed to resend OTP"); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8 font-sans pt-[72px]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">

        {/* Logo icon */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
            <Briefcase size={24} className="text-white" strokeWidth={1.8} />
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-[22px] font-black text-slate-900 text-center">{t("login.title")}</h1>
          <SpeakerButton textKey="login.title" />
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <p className="text-sm text-slate-400 text-center">{t("login.subtitle")}</p>
          <SpeakerButton textKey="login.subtitle" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              {error}
              {unverifiedPhone && (
                <button type="button" onClick={resendOtp}
                  className="block mt-1 text-teal-600 font-semibold underline text-xs">
                  {t("login.resend_otp")}
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Phone field */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-sm font-semibold text-slate-700">{t("login.phone_label")}</label>
              <SpeakerButton textKey="login.phone_label" />
            </div>
            <input
              type="tel"
              placeholder={t("login.phone_placeholder")}
              required
              maxLength={12}
              value={form.phone}
              onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })}
              onFocus={() => setError("")}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-slate-400">{t("login.phone_hint")}</p>
              <SpeakerButton textKey="login.phone_hint" />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-sm font-semibold text-slate-700">{t("login.password_label")}</label>
              <SpeakerButton textKey="login.password_label" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={() => setError("")}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        {/* Register links */}
        <div className="mt-5 space-y-2 text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-1.5">
            <p>
              {t("login.new_worker")}{" "}
              <Link to="/register/worker" className="text-slate-900 font-black hover:text-teal-600 transition-colors">
                {t("login.register_worker")}
              </Link>
            </p>
            <SpeakerButton textKey="login.new_worker" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <p>
              {t("login.new_employer")}{" "}
              <Link to="/register/employer" className="text-slate-900 font-black hover:text-teal-600 transition-colors">
                {t("login.register_employer")}
              </Link>
            </p>
            <SpeakerButton textKey="login.new_employer" />
          </div>
        </div>

      </div>
    </div>
  );
}