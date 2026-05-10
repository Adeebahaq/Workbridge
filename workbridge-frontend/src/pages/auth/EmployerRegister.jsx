import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { Check, Smartphone } from "lucide-react";

// ── block non-alpha keys on name field ───────────────────────
const blockNonAlpha = (e) => {
  if (
    !/^[a-zA-Z\s]$/.test(e.key) &&
    !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export default function EmployerRegister() {
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
    // ── live formatting & validation ──
    if (k === "fullName") {
      v = v.replace(/[^a-zA-Z\s]/g, "").slice(0, 60);
    }
    if (k === "phone") {
      // Sanitize: allow only digits and leading +
      const sanitized = v.replace(/[^0-9+]/g, "");
      if (sanitized.length > 13) return; // cap length
      v = sanitized;
      // Live format check: must start with +92 or 03
      const digits = sanitized.replace(/\D/g, "");
      if (
        sanitized.length >= 2 &&
        !sanitized.startsWith("+92") &&
        !digits.startsWith("03")
      ) {
        setFieldErrors((e) => ({ ...e, phone: "Phone must start with +92 or 03." }));
      } else {
        setFieldErrors((e) => ({ ...e, phone: undefined }));
      }
    }
    if (k === "email" && v.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        setFieldErrors((e) => ({ ...e, email: "Enter a valid email address." }));
      else
        setFieldErrors((e) => ({ ...e, email: undefined }));
    } else if (k === "email") {
      setFieldErrors((e) => ({ ...e, email: undefined }));
    }
    if (k === "password") {
      if (v.length > 0 && v.length < 8)
        setFieldErrors((e) => ({ ...e, password: "Password must be at least 8 characters." }));
      else if (v.length >= 8 && !/[!@#$%^&*(),.?":{}|<>]/.test(v))
        setFieldErrors((e) => ({ ...e, password: "Password must contain at least one special character." }));
      else
        setFieldErrors((e) => ({ ...e, password: undefined }));
    }
    if (k === "confirmPassword") {
      setForm((f) => {
        if (v !== f.password)
          setFieldErrors((e) => ({ ...e, confirmPassword: "Passwords do not match." }));
        else
          setFieldErrors((e) => ({ ...e, confirmPassword: undefined }));
        return f;
      });
    }
    setForm((f) => ({ ...f, [k]: v }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 3)
      errs.fullName = "Full name must be at least 3 letters.";
    // Accept +92XXXXXXXXXX (13 chars) or 03XXXXXXXXX (11 digits)
    const isValidPhone =
      form.phone.match(/^\+92\d{10}$/) || form.phone.match(/^03\d{9}$/);
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
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/auth/register/employer", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });
      setResendTimer(60);
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
    setError("");
    setOtp(["","","","","",""]);
    setTimeout(() => document.getElementById("otp-emp-0")?.focus(), 0);  // focus box 1 instantly
    setLoading(true);
    try {
      await api.post("/auth/resend-otp", { phone: form.phone });
      setResendCooldown(60);
    } catch (err) { setError(err.message || t("employer_register.error_resend")); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (i, v) => {
    const d = [...otpDigits];
    d[i] = v.slice(-1);
    setOtpDigits(d);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const verifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) return setError("Enter all 6 digits");
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { phone: form.phone, otp });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
      fieldErrors[key]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-gray-300 focus:ring-teal"
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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center bg-gray-900 w-5/12 p-12">
        <h2 className="text-3xl font-extrabold text-white leading-snug mb-5">
          Hire <span className="text-teal">Verified Workers</span> with Confidence
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Join thousands of employers who trust WorkBridge for reliable, verified domestic and service workers.
        </p>
        <ul className="space-y-3">
          {features.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-teal flex-shrink-0" />
              <span className="text-gray-300 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {step === 0 ? (
            <>
              <span className="inline-block bg-teal-light text-teal-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                Employer Sign Up
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create Employer Account</h1>
              <p className="text-sm text-gray-500 mb-7">Register in 2 minutes with OTP verification</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

                {/* Full Name */}
                <div>
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
                <div>
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
                <div>
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
                <div>
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
                    : <p className="text-xs text-gray-400 mt-1">At least 8 characters with one special character (!@#$%^&*)</p>}
                </div>

                {/* Confirm Password */}
                <div>
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
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "Creating account…" : "Create Account & Send OTP"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-teal-dark hover:underline">
                  Login here
                </Link>
              </p>
              <p className="text-center text-sm text-gray-500 mt-2">
                Looking for work?{" "}
                <Link to="/register/worker" className="font-semibold text-teal-dark hover:underline">
                  Register as Worker
                </Link>
              </p>
            </>
          ) : (
            /* OTP Step */
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-teal" />
              </div>
              <span className="inline-block bg-teal-light text-teal-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                Verification
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Enter OTP Code</h2>
              <p className="text-sm text-gray-500 mb-1">
                A 6-digit code has been sent to <strong>{form.phone}</strong>
              </p>
              <p className="text-xs text-teal-600 font-medium mb-6">(Demo: use 1 2 3 4 5 6)</p>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <div className="flex gap-3 justify-center mb-6">
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    maxLength={1}
                    inputMode="numeric"
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal"
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

              <p className="text-sm text-gray-500">
                Didn't receive the code?{" "}
                <button
                  onClick={() => {}}
                  disabled={resendTimer > 0}
                  className="font-semibold text-teal-dark disabled:opacity-40"
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
  );
}