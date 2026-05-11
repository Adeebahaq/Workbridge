import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { Check, Smartphone } from "lucide-react";

const blockNonAlpha = (e) => {
  if (
    !/^[a-zA-Z\s]$/.test(e.key) &&
    !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export default function EmployerRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", password: "", confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const otpRefs = React.useRef([]);

  React.useEffect(() => {
    if (step !== 1 || resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer, step]);

  const setField = (k, v) => {
    if (k === "fullName") v = v.replace(/[^a-zA-Z\s]/g, "").slice(0, 60);
    if (k === "phone") {
      const sanitized = v.replace(/[^0-9+]/g, "");
      if (sanitized.length > 13) return;
      v = sanitized;
      const digits = sanitized.replace(/\D/g, "");
      if (sanitized.length >= 2 && !sanitized.startsWith("+92") && !digits.startsWith("03")) {
        setFieldErrors((e) => ({ ...e, phone: "Phone must start with +92 or 03." }));
      } else {
        setFieldErrors((e) => ({ ...e, phone: undefined }));
      }
    }
    if (k === "email" && v.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        setFieldErrors((e) => ({ ...e, email: "Enter a valid email address." }));
      else setFieldErrors((e) => ({ ...e, email: undefined }));
    } else if (k === "email") {
      setFieldErrors((e) => ({ ...e, email: undefined }));
    }
    if (k === "password") {
      if (v.length > 0 && v.length < 8)
        setFieldErrors((e) => ({ ...e, password: "Password must be at least 8 characters." }));
      else if (v.length >= 8 && !/[!@#$%^&*(),.?":{}|<>]/.test(v))
        setFieldErrors((e) => ({ ...e, password: "Password must contain at least one special character." }));
      else setFieldErrors((e) => ({ ...e, password: undefined }));
    }
    if (k === "confirmPassword") {
      setForm((f) => {
        if (v !== f.password)
          setFieldErrors((e) => ({ ...e, confirmPassword: "Passwords do not match." }));
        else setFieldErrors((e) => ({ ...e, confirmPassword: undefined }));
        return f;
      });
    }
    setForm((f) => ({ ...f, [k]: v }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 3)
      errs.fullName = "Full name must be at least 3 letters.";
    const isValidPhone = form.phone.match(/^\+92\d{10}$/) || form.phone.match(/^03\d{9}$/);
    if (!isValidPhone)
      errs.phone = "Enter a valid phone number (e.g., +923001234567 or 03001234567).";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.password || form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
      errs.password = "Password must contain at least one special character.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError(t("employer_register.error_password_match"));
    if (form.password.length < 8) return setError(t("employer_register.error_password_length"));
    if (!/^03[0-9]{2}-[0-9]{7}$/.test(form.phone)) return setError(t("employer_register.error_phone_format"));
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
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
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

  const inputClass = (key) =>
    `block w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 transition-colors box-border ${
      fieldErrors[key]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-gray-300 focus:ring-teal-400"
    }`;

  const features = [
    "Access CNIC-verified worker profiles",
    "Search by service, location & availability",
    "Transparent ratings & reviews",
    "Real-time job request management",
    "Direct in-app messaging",
    "Secure & trusted platform",
  ];

  return (
    <>
      {/* Force box-sizing globally for this page's inputs */}
      <style>{`
        .employer-register-form * {
          box-sizing: border-box;
        }
        .employer-register-form input {
          width: 100%;
          max-width: 100%;
        }
      `}</style>

      <div className="employer-register-form w-full min-h-screen flex flex-col lg:flex-row overflow-x-hidden">

        {/* Left panel — desktop only */}
        <div className="hidden lg:flex flex-col justify-center bg-gray-900 lg:w-5/12 p-12 shrink-0">
          <h2 className="text-3xl font-extrabold text-white leading-snug mb-5">
            Hire <span className="text-teal-400">Verified Workers</span> with Confidence
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Join thousands of employers who trust WorkBridge for reliable, verified domestic and service workers.
          </p>
          <ul className="space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel — full width on mobile */}
        <div className="flex-1 flex flex-col justify-center bg-gray-50 w-full overflow-x-hidden">
          <div className="w-full px-4 py-8 mx-auto" style={{ maxWidth: "460px" }}>

            {step === 0 ? (
              <>
                <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  Employer Sign Up
                </span>
<h1 className="text-2xl font-extrabold text-gray-900 mb-1 mt-4">Create Employer Account</h1>
<p className="text-sm text-gray-500 mb-6">Register in 2 minutes with OTP verification</p>                <p className="text-sm text-gray-500 mb-6">Register in 2 minutes with OTP verification</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 break-words">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 w-full" autoComplete="off">

                  {/* Full Name */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fullName"
                      autoComplete="off"
                      className={inputClass("fullName")}
                      placeholder="Saqib Aslam"
                      value={form.fullName}
                      onKeyDown={blockNonAlpha}
                      onChange={(e) => setField("fullName", e.target.value)}
                      required
                    />
                    {fieldErrors.fullName
                      ? <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
                      : <p className="text-xs text-gray-400 mt-1">Letters only</p>}
                  </div>

                  {/* Phone */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>{" "}
                      <span className="text-gray-400 font-normal">(WhatsApp)</span>
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="off"
                      className={inputClass("phone")}
                      placeholder="+923001234567 or 03001234567"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      required
                    />
                    {fieldErrors.phone
                      ? <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                      : <p className="text-xs text-gray-400 mt-1">e.g. +923001234567 or 03001234567</p>}
                  </div>

                  {/* Email */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address{" "}
                      <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      autoComplete="off"
                      className={inputClass("email")}
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className={inputClass("password")}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      required
                    />
                    {fieldErrors.password
                      ? <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                      : <p className="text-xs text-gray-400 mt-1">At least 8 chars with one special character (!@#$%^&*)</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={inputClass("confirmPassword")}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                      required
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account…" : "Create Account & Send OTP"}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-5">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-teal-600 hover:underline">
                    Login here
                  </Link>
                </p>
                <p className="text-center text-sm text-gray-500 mt-2 pb-6">
                  Looking for work?{" "}
                  <Link to="/register/worker" className="font-semibold text-teal-600 hover:underline">
                    Register as Worker
                  </Link>
                </p>
              </>
            ) : (
              /* OTP Step */
              <div className="text-center w-full">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-7 h-7 text-teal-400" />
                </div>
                <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  Verification
                </span>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Enter OTP Code</h2>
                <p className="text-sm text-gray-500 mb-1 break-words px-2">
                  A 6-digit code has been sent to <strong>{form.phone}</strong>
                </p>
                <p className="text-xs text-teal-600 font-medium mb-6">(Demo: use 1 2 3 4 5 6)</p>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                {/* OTP boxes — sized to always fit on any phone */}
                <div className="flex gap-2 justify-center mb-6">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      maxLength={1}
                      inputMode="numeric"
                      style={{ width: "13%", minWidth: "36px", maxWidth: "52px" }}
                      className="aspect-square text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 box-border"
                    />
                  ))}
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-4"
                >
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>

                <p className="text-sm text-gray-500 pb-6">
                  Didn't receive the code?{" "}
                  <button
                    onClick={() => {}}
                    disabled={resendTimer > 0}
                    className="font-semibold text-teal-600 disabled:opacity-40"
                  >
                    Resend OTP
                  </button>
                  {resendTimer > 0 && (
                    <span className="text-gray-400"> (available in {resendTimer}s)</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}