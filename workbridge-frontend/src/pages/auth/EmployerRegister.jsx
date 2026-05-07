import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import SpeakerButton from "../../components/ui/SpeakerButton";
import { AlertCircle, Check, Smartphone } from "lucide-react";

export default function EmployerRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep]                     = useState(0);
  const [form, setForm]                     = useState({ fullName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp]                       = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);

  const STEPS = [t("employer_register.step_details"), t("employer_register.step_verify")];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Phone formatter: 0300-1234567 ────────────────────────────────────────
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError(t("employer_register.error_password_match"));
    if (form.password.length < 8)
      return setError(t("employer_register.error_password_length"));
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
      return setError("Password must contain at least one special character.");
    if (!/^03[0-9]{2}-[0-9]{7}$/.test(form.phone))
      return setError(t("employer_register.error_phone_format"));
    setLoading(true);
    try {
      await api.post("/auth/register/employer", {
        fullName: form.fullName,
        phone:    form.phone,
        email:    form.email,
        password: form.password,
      });
      setResendCooldown(60);
      setStep(1);
    } catch (err) { setError(err.message || t("employer_register.error_default")); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/verify-otp", { phone: form.phone, otp: otp.join("") });
      navigate("/login", { state: { message: t("employer_register.verified_message") } });
    } catch (err) { setError(err.message || t("employer_register.error_otp")); }
    finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setError(""); setLoading(true);
    try {
      await api.post("/auth/resend-otp", { phone: form.phone });
      setResendCooldown(60);
    } catch (err) { setError(err.message || t("employer_register.error_resend")); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (i, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next);
    if (digit && i < 5) document.getElementById(`otp-emp-${i + 1}`)?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`otp-emp-${i - 1}`)?.focus();
  };
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    document.getElementById(`otp-emp-${Math.min(pasted.length, 5)}`)?.focus();
    e.preventDefault();
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-white";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10 font-sans pt-[90px]">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-col justify-center bg-slate-900 text-white w-2/5 p-10">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center text-lg font-black">W</div>
            <span className="font-black text-lg tracking-tight">Work<span className="text-teal-400">Bridge</span></span>
          </div>

          <div className="flex items-start gap-2 mb-3">
            <h2 className="text-2xl font-black leading-tight">
              {t("employer_register.panel_title_1")}{" "}
              <span className="text-teal-400">{t("employer_register.panel_title_2")}</span>{" "}
              {t("employer_register.panel_title_3")}
            </h2>
            <SpeakerButton
              text={`${t("employer_register.panel_title_1")} ${t("employer_register.panel_title_2")} ${t("employer_register.panel_title_3")}`}
              className="mt-1 shrink-0"
            />
          </div>

          <div className="flex items-start gap-1.5 mb-8">
            <p className="text-slate-400 text-sm leading-relaxed">{t("employer_register.panel_subtitle")}</p>
            <SpeakerButton textKey="employer_register.panel_subtitle" className="mt-0.5 shrink-0" />
          </div>

          <ul className="space-y-3">
            {[
              "employer_register.feature_1",
              "employer_register.feature_2",
              "employer_register.feature_3",
              "employer_register.feature_4",
              "employer_register.feature_5",
              "employer_register.feature_6",
            ].map(key => (
              <li key={key} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-teal-400" strokeWidth={2.5} />
                </span>
                <span>{t(key)}</span>
                <SpeakerButton textKey={key} className="ml-auto shrink-0" />
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto">

          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs font-bold text-teal-600 tracking-widest uppercase">{t("employer_register.heading")}</p>
            <SpeakerButton textKey="employer_register.heading" />
          </div>

          {/* Step bar */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                    i < step   ? "bg-teal-500 border-teal-500 text-white" :
                    i === step ? "bg-slate-900 border-slate-900 text-white" :
                                 "bg-white border-slate-300 text-slate-400"
                  }`}>
                    {i < step ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${i === step ? "text-slate-900" : "text-slate-400"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 transition-all ${i < step ? "bg-teal-500" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step title + subtitle */}
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-black text-slate-900">
              {step === 0 ? t("employer_register.title_step0") : t("employer_register.title_step1")}
            </h1>
            <SpeakerButton textKey={step === 0 ? "employer_register.title_step0" : "employer_register.title_step1"} />
          </div>
          <div className="flex items-center gap-1.5 mb-6">
            <p className="text-sm text-slate-400">
              {step === 0
                ? t("employer_register.subtitle_step0")
                : t("employer_register.subtitle_step1", { phone: form.phone })}
            </p>
            <SpeakerButton
              textKey={step === 0 ? "employer_register.subtitle_step0" : undefined}
              text={step === 1 ? t("employer_register.subtitle_step1", { phone: form.phone }) : undefined}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* ── STEP 0: Details ── */}
          {step === 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("employer_register.full_name")} <span className="text-red-500">*</span>
                  </label>
                  <SpeakerButton textKey="employer_register.full_name" />
                </div>
                <input
                  className={inputCls}
                  placeholder={t("employer_register.full_name_placeholder")}
                  required
                  value={form.fullName}
                  onChange={e => set("fullName", e.target.value)}
                  onFocus={() => setError("")}
                />
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("employer_register.phone")} <span className="text-red-500">*</span>{" "}
                    <span className="text-slate-400 font-normal">({t("employer_register.whatsapp")})</span>
                  </label>
                  <SpeakerButton textKey="employer_register.phone" />
                </div>
                <input
                  className={inputCls}
                  placeholder="0334-1234567"
                  required
                  maxLength={12}
                  value={form.phone}
                  onChange={e => set("phone", formatPhone(e.target.value))}
                  onFocus={() => setError("")}
                />
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-xs text-slate-400">{t("employer_register.phone_hint")}</p>
                  <SpeakerButton textKey="employer_register.phone_hint" />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("employer_register.email")}{" "}
                    <span className="text-slate-400 font-normal">({t("employer_register.optional")})</span>
                  </label>
                  <SpeakerButton textKey="employer_register.email" />
                </div>
                <input
                  className={inputCls}
                  placeholder="email@example.com"
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value.toLowerCase())}
                  onBlur={e => set("email", e.target.value.trim())}
                  onFocus={() => setError("")}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("employer_register.password")} <span className="text-red-500">*</span>
                  </label>
                  <SpeakerButton textKey="employer_register.password" />
                </div>
                <input
                  className={inputCls}
                  placeholder={t("employer_register.password_placeholder")}
                  type="password"
                  required
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  onFocus={() => setError("")}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Min 8 characters with at least one special character (!@#$%^&*).
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    {t("employer_register.confirm_password")} <span className="text-red-500">*</span>
                  </label>
                  <SpeakerButton textKey="employer_register.confirm_password" />
                </div>
                <input
                  className={inputCls}
                  placeholder={t("employer_register.confirm_password_placeholder")}
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={e => set("confirmPassword", e.target.value)}
                  onFocus={() => setError("")}
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 mt-2">
                {loading ? t("employer_register.creating") : t("employer_register.submit")}
              </button>

              <p className="text-center text-sm text-slate-500">
                {t("employer_register.have_account")}{" "}
                <Link to="/login" className="text-teal-600 font-bold hover:underline">{t("employer_register.sign_in")}</Link>
              </p>
            </form>
          )}

          {/* ── STEP 1: OTP ── */}
          {step === 1 && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div className="text-center py-2">

                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} className="text-teal-500" strokeWidth={1.5} />
                </div>

                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-base font-black text-slate-900">{t("employer_register.check_whatsapp")}</h2>
                  <SpeakerButton textKey="employer_register.check_whatsapp" />
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-sm text-slate-500">
                    {t("employer_register.otp_sent_to")} <span className="font-bold text-teal-600">{form.phone}</span>
                  </p>
                  <SpeakerButton text={`${t("employer_register.otp_sent_to")} ${form.phone}`} />
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <p className="text-xs text-slate-400">{t("employer_register.otp_expires")}</p>
                  <SpeakerButton textKey="employer_register.otp_expires" />
                </div>
              </div>

              {/* OTP inputs */}
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} id={`otp-emp-${i}`} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    maxLength={1} inputMode="numeric"
                    className="w-12 h-14 text-center text-2xl font-black border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-900"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading || otp.join("").length !== 6}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-sm transition-all disabled:opacity-50">
                {loading ? t("employer_register.verifying") : t("employer_register.verify_btn")}
              </button>

              {/* Resend row */}
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                {resendCooldown > 0 ? (
                  <>
                    <span>{t("employer_register.no_code")}</span>
                    <span className="font-bold text-slate-700">{t("employer_register.resend_wait", { s: resendCooldown })}</span>
                    <SpeakerButton text={`${t("employer_register.no_code")} ${t("employer_register.resend_wait", { s: resendCooldown })}`} />
                  </>
                ) : (
                  <>
                    <span>{t("employer_register.no_code")}</span>
                    <SpeakerButton textKey="employer_register.no_code" />
                    <button type="button" onClick={resendOtp} disabled={loading}
                      className="text-teal-600 font-bold hover:underline disabled:opacity-50">
                      {t("employer_register.resend_btn")}
                    </button>
                  </>
                )}
              </div>

              {/* Wrong number row */}
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-400">
                <span>{t("employer_register.wrong_number")}</span>
                <SpeakerButton textKey="employer_register.wrong_number" />
                <button type="button"
                  onClick={() => { setStep(0); setOtp(["","","","","",""]); setError(""); }}
                  className="text-slate-600 font-semibold hover:underline">
                  {t("employer_register.go_back")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}