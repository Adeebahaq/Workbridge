import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import SpeakerButton from "../../components/ui/SpeakerButton";
import {
  Briefcase, AlertCircle, Check, ArrowLeft, ArrowRight,
  Home, Car, Leaf, Baby, ChefHat, Zap, Wrench, Shield,
  Sparkles, Shirt, CarFront, HeartHandshake,
  Upload, CheckCircle, Smartphone,
} from "lucide-react";

const DAYS      = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAYS_FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const EMP_TYPE  = ["Full-time","Part-time","On-call/Daily Basis"];
const CITIES    = ["Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta"];

const FALLBACK_SERVICES = [
  { _id: "domestic",  name: "Domestic Helpers" },
  { _id: "drivers",   name: "Drivers" },
  { _id: "gardeners", name: "Gardeners" },
  { _id: "baby",      name: "Babysitters" },
  { _id: "cooks",     name: "Cooks" },
  { _id: "electric",  name: "Electricians" },
  { _id: "plumbers",  name: "Plumbers" },
  { _id: "security",  name: "Security Guards" },
  { _id: "cleaning",  name: "House Cleaning" },
  { _id: "laundry",   name: "Laundry/Ironing" },
  { _id: "carwash",   name: "Car Washing" },
  { _id: "elderly",   name: "Elderly Care" },
];

const SERVICE_ICON_MAP = {
  "Domestic Helpers": Home,
  "Drivers":          Car,
  "Gardeners":        Leaf,
  "Babysitters":      Baby,
  "Cooks":            ChefHat,
  "Electricians":     Zap,
  "Plumbers":         Wrench,
  "Security Guards":  Shield,
  "House Cleaning":   Sparkles,
  "Laundry/Ironing":  Shirt,
  "Car Washing":      CarFront,
  "Elderly Care":     HeartHandshake,
};

function ServiceIcon({ name, active }) {
  const Icon = SERVICE_ICON_MAP[name] || Wrench;
  return <Icon size={22} strokeWidth={1.8} className={active ? "text-white" : "text-slate-400"} />;
}

function LabelRow({ textKey, required, className = "" }) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center gap-1.5 mb-1.5 ${className}`}>
      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
        {t(textKey)}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <SpeakerButton textKey={textKey} />
    </div>
  );
}

function HintRow({ textKey, text }) {
  const { t } = useTranslation();
  const display = text ?? t(textKey);
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <p className="text-xs text-slate-400">{display}</p>
      {textKey && <SpeakerButton textKey={textKey} />}
    </div>
  );
}

// ── Formatters ────────────────────────────────────────────────────────────────
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const formatCnic = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

const blockNonAlpha = (e) => {
  if (
    !/^[a-zA-Z\s]$/.test(e.key) &&
    !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export default function WorkerRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [services, setServices]   = useState(FALLBACK_SERVICES);
  const [cnicFront, setCnicFront] = useState(null);
  const [form, setForm] = useState({
    fullName:"", fatherSpouseName:"", dateOfBirth:"", gender:"Male",
    maritalStatus:"Single", cnicNumber:"", phone:"",
    currentAddress:"", password:"", confirmPassword:"",
    employmentType:"Full-time", preferredCity:"Lahore", maxTravelDistance:20,
    services:[], daysAvailable:[], preferredAreas:[], preferredWorkingHours:[],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [otp, setOtp]                       = useState(["","","","","",""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);

  const STEPS = [
    t("worker_register.step_personal"),
    t("worker_register.step_services"),
    t("worker_register.step_availability"),
    t("worker_register.step_documents"),
    t("worker_register.step_otp"),
  ];

  const today  = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];
  const minDob = new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];

  useEffect(() => {
    api.get("/services")
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) setServices(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Field setter with inline validation for phone, cnic, password ─────────
  const setField = (k, v) => {
    if (k === "fullName")         v = v.replace(/[^a-zA-Z\s]/g, "").slice(0, 60);
    if (k === "fatherSpouseName") v = v.replace(/[^a-zA-Z\s]/g, "").slice(0, 60);

    if (k === "phone") {
      v = formatPhone(v);
      const digits = v.replace(/\D/g, "");
      if (digits.length >= 2 && !digits.startsWith("03"))
        setFieldErrors(e => ({ ...e, phone: "Phone must start with 03." }));
      else
        setFieldErrors(e => ({ ...e, phone: undefined }));
    }

    if (k === "cnicNumber") {
      v = formatCnic(v);
      const digits = v.replace(/\D/g, "");
      if (digits.length >= 5 && !digits.startsWith("35202"))
        setFieldErrors(e => ({ ...e, cnicNumber: "CNIC must start with 35202." }));
      else
        setFieldErrors(e => ({ ...e, cnicNumber: undefined }));
    }

    if (k === "password") {
      if (v.length > 0 && v.length < 8)
        setFieldErrors(e => ({ ...e, password: "Password must be at least 8 characters." }));
      else if (v.length >= 8 && !/[!@#$%^&*(),.?":{}|<>]/.test(v))
        setFieldErrors(e => ({ ...e, password: 'Must contain at least one special character (!@#$%^&*).' }));
      else
        setFieldErrors(e => ({ ...e, password: undefined }));
    }

    if (k === "confirmPassword") {
      setForm(f => {
        if (v !== f.password)
          setFieldErrors(e => ({ ...e, confirmPassword: "Passwords do not match." }));
        else
          setFieldErrors(e => ({ ...e, confirmPassword: undefined }));
        return f;
      });
    }

    if (!["phone", "cnicNumber", "password", "confirmPassword"].includes(k))
      setFieldErrors(e => ({ ...e, [k]: undefined }));

    setForm(f => ({ ...f, [k]: v }));
  };

  // ── Keep plain set() for non-step-0 fields (availability, etc.) ──────────
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleArr = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));

  const handleOtpChange = (i, val) => {
    const digit = val.replace(/\D/g,"").slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next);
    if (digit && i < 5) document.getElementById(`otp-w-${i+1}`)?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`otp-w-${i-1}`)?.focus();
  };
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((d,i) => { next[i] = d; });
    setOtp(next);
    document.getElementById(`otp-w-${Math.min(pasted.length,5)}`)?.focus();
    e.preventDefault();
  };

  // ── Step validation (now also checks inline fieldErrors) ─────────────────
  const validateStep = () => {
    setError("");
    const errs = {};

    if (step === 0) {
      if (!form.fullName.trim())
        errs.fullName = "Full name is required.";
      else if (form.fullName.trim().length < 3)
        errs.fullName = "Name must be at least 3 characters.";

      if (!form.fatherSpouseName.trim())
        errs.fatherSpouseName = "Father/Spouse name is required.";
      else if (form.fatherSpouseName.trim().length < 3)
        errs.fatherSpouseName = "Name must be at least 3 characters.";

      if (!form.dateOfBirth)
        errs.dateOfBirth = t("worker_register.err_dob");
      else if (form.dateOfBirth > maxDob)
        errs.dateOfBirth = "You must be at least 18 years old to register.";
      else if (form.dateOfBirth < minDob)
        errs.dateOfBirth = "Age must not exceed 60 years.";

      if (!form.cnicNumber.trim())
        errs.cnicNumber = t("worker_register.err_cnic_required");
      else if (!/^35202-[0-9]{7}-[0-9]{1}$/.test(form.cnicNumber.trim()))
        errs.cnicNumber = t("worker_register.err_cnic_format");

      if (!form.phone.trim())
        errs.phone = t("worker_register.err_phone_required");
      else if (!/^03[0-9]{2}-[0-9]{7}$/.test(form.phone.trim()))
        errs.phone = t("worker_register.err_phone_format");

      if (!form.currentAddress.trim())
        errs.currentAddress = t("worker_register.err_address");
      else if (!/[a-zA-Z]/.test(form.currentAddress))
        errs.currentAddress = "Address must contain letters, not just numbers.";

      if (!form.password || form.password.length < 8)
        errs.password = t("worker_register.err_password_length");
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
        errs.password = "Password must contain at least one special character.";

      if (form.password !== form.confirmPassword)
        errs.confirmPassword = t("worker_register.err_password_match");

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return false;
      }
    }

    if (step === 1 && form.services.length === 0)
      return setError(t("worker_register.err_services")), false;
    if (step === 2 && form.daysAvailable.length === 0)
      return setError(t("worker_register.err_days")), false;
    return true;
  };

  const next = (e) => { e?.preventDefault(); if (validateStep()) setStep(s => s + 1); };
  const back = () => { setError(""); setFieldErrors({}); setStep(s => s - 1); };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setError("");
    if (!cnicFront) return setError(t("worker_register.err_cnic_image"));
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => payload.append(k, item));
        else payload.append(k, v);
      });
      payload.append("cnicFrontImage", cnicFront);
      await api.post("/workers/register", payload);
      setResendCooldown(60);
      setStep(4);
    } catch (err) {
      setError(err.message || t("worker_register.err_submit"));
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/verify-otp", { phone: form.phone, otp: otp.join("") });
      navigate("/login");
    } catch (err) {
      setError(err.message || t("worker_register.err_otp"));
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setError(""); setLoading(true);
    try {
      await api.post("/auth/resend-otp", { phone: form.phone });
      setResendCooldown(60);
    } catch (err) { setError(err.message || t("worker_register.err_resend")); }
    finally { setLoading(false); }
  };

  // ── Dynamic input class – turns red on field error ────────────────────────
  const inputCls = (key) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-white ${
      fieldErrors[key]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
    }`;

  const selectCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-white";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans pt-[90px]">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Briefcase size={24} className="text-white" strokeWidth={1.8} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl font-black text-slate-900">{t("worker_register.title")}</h1>
            <SpeakerButton textKey="worker_register.title" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <p className="text-sm text-slate-400">{t("worker_register.subtitle")}</p>
            <SpeakerButton textKey="worker_register.subtitle" />
          </div>
        </div>

        {/* Step Bar */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                  i < step   ? "bg-teal-500 border-teal-500 text-white" :
                  i === step ? "bg-slate-900 border-slate-900 text-white" :
                               "bg-white border-slate-300 text-slate-400"
                }`}>
                  {i < step ? <Check size={13} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap ${
                  i === step ? "text-slate-900" : i < step ? "text-teal-600" : "text-slate-400"
                }`}>{label.split(" ")[0]}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${i < step ? "bg-teal-500" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* ── STEP 0: Personal Info ── */}
          {step === 0 && (
            <form onSubmit={next}>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-base font-black text-slate-900">{t("worker_register.step_personal")}</h2>
                <SpeakerButton textKey="worker_register.step_personal" />
              </div>

              <div className="space-y-4">

                {/* Full Name */}
                <div>
                  <LabelRow textKey="worker_register.full_name" required />
                  <input
                    className={inputCls("fullName")}
                    placeholder={t("worker_register.full_name_placeholder")}
                    value={form.fullName}
                    onKeyDown={blockNonAlpha}
                    onChange={e => setField("fullName", e.target.value)}
                  />
                  {fieldErrors.fullName
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
                    : <p className="text-xs text-slate-400 mt-1">Letters only</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Father/Spouse Name */}
                  <div>
                    <LabelRow textKey="worker_register.father_name" required />
                    <input
                      className={inputCls("fatherSpouseName")}
                      placeholder={t("worker_register.father_name_placeholder")}
                      value={form.fatherSpouseName}
                      onKeyDown={blockNonAlpha}
                      onChange={e => setField("fatherSpouseName", e.target.value)}
                    />
                    {fieldErrors.fatherSpouseName
                      ? <p className="text-xs text-red-500 mt-1">{fieldErrors.fatherSpouseName}</p>
                      : <p className="text-xs text-slate-400 mt-1">Letters only</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <LabelRow textKey="worker_register.dob" required />
                    <input
                      type="date"
                      className={inputCls("dateOfBirth")}
                      min={minDob}
                      max={maxDob}
                      value={form.dateOfBirth}
                      onKeyDown={e => {
                        if (!["Tab","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Delete","Backspace"].includes(e.key))
                          e.preventDefault();
                      }}
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) { setField("dateOfBirth", ""); return; }
                        const year = parseInt(val.split("-")[0], 10);
                        if (year > today.getFullYear()) return;
                        setField("dateOfBirth", val);
                      }}
                    />
                    {fieldErrors.dateOfBirth
                      ? <p className="text-xs text-red-500 mt-1">{fieldErrors.dateOfBirth}</p>
                      : <HintRow textKey="worker_register.dob_hint" />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <LabelRow textKey="worker_register.gender" required />
                    <select className={selectCls} value={form.gender} onChange={e => set("gender", e.target.value)}>
                      {["Male","Female","Other"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  {/* Marital Status */}
                  <div>
                    <LabelRow textKey="worker_register.marital_status" />
                    <select className={selectCls} value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)}>
                      {["Single","Married","Divorced","Widowed"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* CNIC */}
                <div>
                  <LabelRow textKey="worker_register.cnic" required />
                  <input
                    className={inputCls("cnicNumber")}
                    placeholder="35202-XXXXXXX-X"
                    maxLength={15}
                    value={form.cnicNumber}
                    onChange={e => setField("cnicNumber", e.target.value)}
                  />
                  {fieldErrors.cnicNumber
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.cnicNumber}</p>
                    : <HintRow textKey="worker_register.cnic_hint" />}
                </div>

                {/* Phone */}
                <div>
                  <LabelRow textKey="worker_register.phone" required />
                  <input
                    className={inputCls("phone")}
                    placeholder="03XX-XXXXXXX"
                    maxLength={12}
                    value={form.phone}
                    onChange={e => setField("phone", e.target.value)}
                  />
                  {fieldErrors.phone
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                    : <HintRow textKey="worker_register.phone_hint" />}
                </div>

                {/* Current Address */}
                <div>
                  <LabelRow textKey="worker_register.address" required />
                  <input
                    className={inputCls("currentAddress")}
                    placeholder={t("worker_register.address_placeholder")}
                    value={form.currentAddress}
                    onKeyDown={e => {
                      if (["+","=","*","#","@","!","$","%","^","&","(",")",`_`].includes(e.key))
                        e.preventDefault();
                    }}
                    onChange={e => {
                      const val = e.target.value;
                      if (val.length > 0 && !/[a-zA-Z]/.test(val)) return;
                      setField("currentAddress", val);
                    }}
                  />
                  {fieldErrors.currentAddress
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.currentAddress}</p>
                    : <p className="text-xs text-slate-400 mt-1">e.g. House 5, Street 3, Lahore</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <LabelRow textKey="worker_register.password" required />
                    <input
                      type="password"
                      className={inputCls("password")}
                      placeholder={t("worker_register.password_placeholder")}
                      value={form.password}
                      onChange={e => setField("password", e.target.value)}
                    />
                    {fieldErrors.password
                      ? <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                      : <p className="text-xs text-slate-400 mt-1">Min 8 chars with at least one special character (!@#$%^&*).</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <LabelRow textKey="worker_register.confirm_password" required />
                    <input
                      type="password"
                      className={inputCls("confirmPassword")}
                      placeholder={t("worker_register.confirm_password_placeholder")}
                      value={form.confirmPassword}
                      onChange={e => setField("confirmPassword", e.target.value)}
                    />
                    {fieldErrors.confirmPassword &&
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button type="submit" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  {t("worker_register.next")} <ArrowRight size={15} />
                </button>
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                {t("worker_register.have_account")}{" "}
                <a href="/login" className="text-teal-600 font-bold hover:underline">{t("worker_register.sign_in")}</a>
              </p>
            </form>
          )}

          {/* ── STEP 1: Services ── */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-black text-slate-900">{t("worker_register.services_title")}</h2>
                <SpeakerButton textKey="worker_register.services_title" />
              </div>
              <div className="flex items-center gap-1.5 mb-5">
                <p className="text-sm text-slate-400">{t("worker_register.services_subtitle")}</p>
                <SpeakerButton textKey="worker_register.services_subtitle" />
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {services.map(s => {
                  const active = form.services.includes(s._id);
                  return (
                    <button key={s._id} type="button" onClick={() => toggleArr("services", s._id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all ${
                        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                      }`}>
                      <ServiceIcon name={s.name} active={active} />
                      <span className="text-[10px] font-bold leading-tight">{s.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" onClick={back} className="flex items-center gap-2 border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">
                  <ArrowLeft size={15} /> {t("worker_register.back")}
                </button>
                <button type="button" onClick={next} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  {t("worker_register.next")} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Availability ── */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-base font-black text-slate-900">{t("worker_register.availability_title")}</h2>
                <SpeakerButton textKey="worker_register.availability_title" />
              </div>

              <div className="space-y-5">
                <div>
                  <LabelRow textKey="worker_register.available_days" required />
                  <div className="flex gap-2 flex-wrap mt-1">
                    {DAYS.map((d, i) => {
                      const full = DAYS_FULL[i];
                      const active = form.daysAvailable.includes(full);
                      return (
                        <button key={d} type="button" onClick={() => toggleArr("daysAvailable", full)}
                          className={`w-11 h-11 rounded-xl text-sm font-bold border-2 transition-all ${
                            active ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                          }`}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <LabelRow textKey="worker_register.working_hours" />
                  <div className="flex gap-2 flex-wrap mt-1">
                    {[
                      t("worker_register.hours_morning"),
                      t("worker_register.hours_afternoon"),
                      t("worker_register.hours_evening"),
                      t("worker_register.hours_flexible"),
                    ].map(h => {
                      const active = form.preferredWorkingHours.includes(h);
                      return (
                        <button key={h} type="button" onClick={() => toggleArr("preferredWorkingHours", h)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                            active ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                          }`}>
                          {active && <Check size={12} strokeWidth={3} />}
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <LabelRow textKey="worker_register.preferred_city" />
                    <select className={selectCls} value={form.preferredCity} onChange={e => set("preferredCity", e.target.value)}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <LabelRow textKey="worker_register.max_distance" />
                    <select className={selectCls} value={form.maxTravelDistance} onChange={e => set("maxTravelDistance", Number(e.target.value))}>
                      {[5,10,20,30,50].map(d => <option key={d} value={d}>{d} km</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <LabelRow textKey="worker_register.employment_type" />
                  <select className={selectCls} value={form.employmentType} onChange={e => set("employmentType", e.target.value)}>
                    {EMP_TYPE.map(tp => <option key={tp}>{tp}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" onClick={back} className="flex items-center gap-2 border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">
                  <ArrowLeft size={15} /> {t("worker_register.back")}
                </button>
                <button type="button" onClick={next} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  {t("worker_register.next")} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Documents ── */}
          {step === 3 && (
            <form onSubmit={submitRegistration}>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-black text-slate-900">{t("worker_register.docs_title")}</h2>
                <SpeakerButton textKey="worker_register.docs_title" />
              </div>
              <div className="flex items-center gap-1.5 mb-5">
                <p className="text-sm text-slate-400">{t("worker_register.docs_subtitle")}</p>
                <SpeakerButton textKey="worker_register.docs_subtitle" />
              </div>

              <div className="mb-6">
                <LabelRow textKey="worker_register.cnic_front" required />
                <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all">
                  <input type="file" accept="image/*" className="hidden" onChange={e => setCnicFront(e.target.files[0])} />
                  {cnicFront ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle size={36} className="text-teal-500" />
                      <p className="text-sm font-semibold text-teal-600">{cnicFront.name}</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <p className="text-xs text-slate-400">{t("worker_register.click_to_change")}</p>
                        <SpeakerButton textKey="worker_register.click_to_change" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={30} className="text-slate-300" />
                      <div className="flex items-center justify-center gap-1.5">
                        <p className="text-sm font-bold text-teal-600">{t("worker_register.click_to_upload")}</p>
                        <SpeakerButton textKey="worker_register.click_to_upload" />
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <p className="text-xs text-slate-400">{t("worker_register.upload_hint")}</p>
                        <SpeakerButton textKey="worker_register.upload_hint" />
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={back} className="flex items-center gap-2 border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">
                  <ArrowLeft size={15} /> {t("worker_register.back")}
                </button>
                <button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all disabled:opacity-60">
                  {loading ? t("worker_register.submitting") : t("worker_register.submit_btn")}
                </button>
              </div>
            </form>
          )}

   {/* ── STEP 4: OTP ── */}
          {step === 4 && (
            <form onSubmit={verifyOtp}>
              <div className="text-center mb-7">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={30} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-lg font-black text-slate-900">{t("worker_register.otp_title")}</h2>
                  <SpeakerButton textKey="worker_register.otp_title" />
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-sm text-slate-500">
                    {t("worker_register.otp_sent_to")} <span className="font-bold text-teal-600">{form.phone}</span> {t("worker_register.via_whatsapp")}
                  </p>
                  <SpeakerButton text={`${t("worker_register.otp_sent_to")} ${form.phone} ${t("worker_register.via_whatsapp")}`} />
                </div>
              </div>

              <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} id={`otp-w-${i}`} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    maxLength={1} inputMode="numeric"
                    className="w-12 h-14 text-center text-2xl font-black border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-900 bg-white"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading || otp.join("").length !== 6}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl text-sm transition-all disabled:opacity-50 mb-4">
                {loading ? t("worker_register.verifying") : t("worker_register.verify_btn")}
              </button>

              <p className="text-center text-sm text-slate-500">
                {t("worker_register.no_code")}{" "}
                {resendCooldown > 0
                  ? <span className="font-bold text-slate-700">{t("worker_register.resend_wait", { s: resendCooldown })}</span>
                  : <button type="button" onClick={resendOtp} disabled={loading} className="text-teal-600 font-bold hover:underline disabled:opacity-50">
                      {t("worker_register.resend_btn")}
                    </button>
                }
              </p>
              <p className="text-center text-sm text-slate-500 mt-2">
                {t("worker_register.have_account")}{" "}
                <a href="/login" className="text-teal-600 font-bold hover:underline">{t("worker_register.sign_in")}</a>
              </p>
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={back}
                  className="flex items-center gap-2 border border-slate-200 text-slate-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft size={15} /> {t("worker_register.back")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}