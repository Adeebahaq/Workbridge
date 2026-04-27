import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import SpeakerButton from "../../components/ui/SpeakerButton";

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

const SERVICE_ICONS = {
  "Domestic Helpers":"🏠","Drivers":"🚗","Gardeners":"🌿",
  "Babysitters":"👶","Cooks":"🍳","Electricians":"⚡",
  "Plumbers":"🔧","Security Guards":"🛡️","House Cleaning":"🧹",
  "Laundry/Ironing":"👔","Car Washing":"🚙","Elderly Care":"👴",
};

/**
 * LabelRow — renders a label text + a SpeakerButton inline.
 * Usage: <LabelRow textKey="worker_register.full_name" required />
 */
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

/**
 * HintRow — renders hint text + a SpeakerButton inline.
 */
function HintRow({ textKey }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <p className="text-xs text-slate-400">{t(textKey)}</p>
      <SpeakerButton textKey={textKey} />
    </div>
  );
}

export default function WorkerRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [services, setServices]   = useState(FALLBACK_SERVICES);
  const [cnicFront, setCnicFront] = useState(null);
  const [form, setForm] = useState({
    fullName:"",phone:"",password:"",confirmPassword:"",
    cnicNumber:"",cnicExpiryDate:"",currentAddress:"",
    fatherSpouseName:"",dateOfBirth:"",gender:"Male",
    maritalStatus:"Single",employmentType:"Full-time",
    preferredCity:"Lahore",maxTravelDistance:20,
    services:[],daysAvailable:[],preferredAreas:[],preferredWorkingHours:[],
  });
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

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.fullName.trim())         return setError(t("worker_register.err_full_name")), false;
      if (!form.fatherSpouseName.trim()) return setError(t("worker_register.err_father_name")), false;
      if (!form.dateOfBirth)             return setError(t("worker_register.err_dob")), false;
      if (!form.cnicNumber.trim())       return setError(t("worker_register.err_cnic_required")), false;
      if (!/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(form.cnicNumber))
        return setError(t("worker_register.err_cnic_format")), false;
      if (!form.phone.trim())            return setError(t("worker_register.err_phone_required")), false;
      if (!/^03[0-9]{2}-[0-9]{7}$/.test(form.phone))
        return setError(t("worker_register.err_phone_format")), false;
      if (!form.currentAddress.trim())   return setError(t("worker_register.err_address")), false;
      if (!form.password)                return setError(t("worker_register.err_password_required")), false;
      if (form.password.length < 8)      return setError(t("worker_register.err_password_length")), false;
      if (form.password !== form.confirmPassword) return setError(t("worker_register.err_password_match")), false;
    }
    if (step === 1 && form.services.length === 0)
      return setError(t("worker_register.err_services")), false;
    if (step === 2 && form.daysAvailable.length === 0)
      return setError(t("worker_register.err_days")), false;
    return true;
  };

  const next = (e) => { e?.preventDefault(); if (validateStep()) setStep(s => s + 1); };
  const back = () => { setError(""); setStep(s => s - 1); };

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

  const inputCls  = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-white";
  const selectCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-white";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans pt-[90px]">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">🧰</div>
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
                  i < step  ? "bg-teal-500 border-teal-500 text-white" :
                  i === step ? "bg-slate-900 border-slate-900 text-white" :
                               "bg-white border-slate-300 text-slate-400"
                }`}>
                  {i < step ? "✓" : i + 1}
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
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              ⚠️ {error}
            </div>
          )}

          {/* ── STEP 0: Personal Info ── */}
          {step === 0 && (
            <form onSubmit={next}>
              {/* Step heading with speaker */}
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-base font-black text-slate-900">{t("worker_register.step_personal")}</h2>
                <SpeakerButton textKey="worker_register.step_personal" />
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <LabelRow textKey="worker_register.full_name" required />
                  <input className={inputCls} placeholder={t("worker_register.full_name_placeholder")} value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Father Name */}
                  <div>
                    <LabelRow textKey="worker_register.father_name" required />
                    <input className={inputCls} placeholder={t("worker_register.father_name_placeholder")} value={form.fatherSpouseName} onChange={e => set("fatherSpouseName", e.target.value)} />
                  </div>
                  {/* Date of Birth */}
                  <div>
                    <LabelRow textKey="worker_register.dob" required />
                    <input className={inputCls} type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
                    <HintRow textKey="worker_register.dob_hint" />
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
                  <input className={inputCls} placeholder="35202-XXXXXXX-X" value={form.cnicNumber} onChange={e => set("cnicNumber", e.target.value)} />
                  <HintRow textKey="worker_register.cnic_hint" />
                </div>

                {/* Phone */}
                <div>
                  <LabelRow textKey="worker_register.phone" required />
                  <input className={inputCls} placeholder="03XX-XXXXXXX" value={form.phone} onChange={e => set("phone", e.target.value)} />
                  <HintRow textKey="worker_register.phone_hint" />
                </div>

                {/* Address */}
                <div>
                  <LabelRow textKey="worker_register.address" required />
                  <input className={inputCls} placeholder={t("worker_register.address_placeholder")} value={form.currentAddress} onChange={e => set("currentAddress", e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <LabelRow textKey="worker_register.password" required />
                    <input className={inputCls} type="password" placeholder={t("worker_register.password_placeholder")} value={form.password} onChange={e => set("password", e.target.value)} />
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <LabelRow textKey="worker_register.confirm_password" required />
                    <input className={inputCls} type="password" placeholder={t("worker_register.confirm_password_placeholder")} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  {t("worker_register.next")} →
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
                      <span className="text-2xl">{SERVICE_ICONS[s.name] || "🔧"}</span>
                      <span className="text-[10px] font-bold leading-tight">{s.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={back} className="flex items-center gap-2 border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">
                  ← {t("worker_register.back")}
                </button>
                <button type="button" onClick={next} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  {t("worker_register.next")} →
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
                {/* Available Days */}
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

                {/* Working Hours */}
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
                          className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                            active ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                          }`}>
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Preferred City */}
                  <div>
                    <LabelRow textKey="worker_register.preferred_city" />
                    <select className={selectCls} value={form.preferredCity} onChange={e => set("preferredCity", e.target.value)}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Max Distance */}
                  <div>
                    <LabelRow textKey="worker_register.max_distance" />
                    <select className={selectCls} value={form.maxTravelDistance} onChange={e => set("maxTravelDistance", Number(e.target.value))}>
                      {[5,10,20,30,50].map(d => <option key={d} value={d}>{d} km</option>)}
                    </select>
                  </div>
                </div>

                {/* Employment Type */}
                <div>
                  <LabelRow textKey="worker_register.employment_type" />
                  <select className={selectCls} value={form.employmentType} onChange={e => set("employmentType", e.target.value)}>
                    {EMP_TYPE.map(tp => <option key={tp}>{tp}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" onClick={back} className="flex items-center gap-2 border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">
                  ← {t("worker_register.back")}
                </button>
                <button type="button" onClick={next} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  {t("worker_register.next")} →
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
                    <div>
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-sm font-semibold text-teal-600">{cnicFront.name}</p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <p className="text-xs text-slate-400">{t("worker_register.click_to_change")}</p>
                        <SpeakerButton textKey="worker_register.click_to_change" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2 text-slate-300">📷</div>
                      <div className="flex items-center justify-center gap-1.5">
                        <p className="text-sm font-bold text-teal-600">{t("worker_register.click_to_upload")}</p>
                        <SpeakerButton textKey="worker_register.click_to_upload" />
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <p className="text-xs text-slate-400">{t("worker_register.upload_hint")}</p>
                        <SpeakerButton textKey="worker_register.upload_hint" />
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={back} className="flex items-center gap-2 border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">
                  ← {t("worker_register.back")}
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
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
}