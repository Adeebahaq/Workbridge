import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Home, Car, Leaf, Baby, ChefHat, Zap, Wrench, Shield,
  Sparkles, Shirt, CarFront, HeartHandshake,
  X, Upload, CheckCircle, AlertCircle, Check,
} from "lucide-react";

const DAYS_FULL  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CITIES     = ["Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta"];
const EMP_TYPE   = ["Full-time","Part-time","On-call/Daily Basis"];
const WORKING_HOURS = [
  "Morning (6 AM - 2 PM)",
  "Afternoon (12 PM - 6 PM)",
  "Evening (4 PM - 10 PM)",
  "Flexible",
];

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

// ── Formatters (from WorkerRegister) ─────────────────────────────────────────
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

function ServiceIcon({ name, active }) {
  const Icon = SERVICE_ICON_MAP[name] || Wrench;
  return <Icon size={18} strokeWidth={1.8} className={active ? "text-teal-600" : "text-slate-400"} />;
}

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

export default function AdminCreateWorker({ onClose, onSuccess }) {
  const today  = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];
  const minDob = new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];

  const [form, setForm] = useState({
    fullName: "", phone: "", password: "", confirmPassword: "",
    cnicNumber: "", currentAddress: "", fatherSpouseName: "",
    dateOfBirth: "", gender: "Male", maritalStatus: "Single",
    employmentType: "Full-time", preferredCity: "Lahore",
    maxTravelDistance: 20,
    services: [], daysAvailable: [], preferredWorkingHours: [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [cnicFront, setCnicFront]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [serviceList, setServiceList] = useState(FALLBACK_SERVICES);

  useEffect(() => {
    api.get("/services")
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) setServiceList(list);
      })
      .catch(() => {});
  }, []);

  // ── Field setter with inline validation (from WorkerRegister) ────────────
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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleArr = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));

  // ── Full validation on submit (from WorkerRegister) ───────────────────────
  const validate = () => {
    const errs = {};

    if (!form.fullName.trim())
      errs.fullName = "Full name is required.";
    else if (form.fullName.trim().length < 3)
      errs.fullName = "Name must be at least 3 characters.";

    if (!form.fatherSpouseName.trim())
      errs.fatherSpouseName = "Father/Spouse name is required.";
    else if (form.fatherSpouseName.trim().length < 3)
      errs.fatherSpouseName = "Name must be at least 3 characters.";

    if (!form.dateOfBirth)
      errs.dateOfBirth = "Date of birth is required.";
    else if (form.dateOfBirth > maxDob)
      errs.dateOfBirth = "Worker must be at least 18 years old.";
    else if (form.dateOfBirth < minDob)
      errs.dateOfBirth = "Age must not exceed 60 years.";

    if (!form.cnicNumber.trim())
      errs.cnicNumber = "CNIC number is required.";
    else if (!/^35202-[0-9]{7}-[0-9]{1}$/.test(form.cnicNumber.trim()))
      errs.cnicNumber = "CNIC format must be: 35202-XXXXXXX-X";

    if (!form.phone.trim())
      errs.phone = "Phone number is required.";
    else if (!/^03[0-9]{2}-[0-9]{7}$/.test(form.phone.trim()))
      errs.phone = "Phone format must be: 03XX-XXXXXXX";

    if (!form.currentAddress.trim())
      errs.currentAddress = "Address is required.";
    else if (!/[a-zA-Z]/.test(form.currentAddress))
      errs.currentAddress = "Address must contain letters, not just numbers.";

    if (!form.password || form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
      errs.password = "Password must contain at least one special character (!@#$%^&*).";

    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";

    if (form.services.length === 0)
      errs.services = "Select at least one service.";

    if (form.daysAvailable.length === 0)
      errs.daysAvailable = "Select at least one available day.";

    if (!cnicFront)
      errs.cnicFront = "CNIC front image is required.";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fix the errors below before submitting.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setLoading(true);

    try {
      const payload = new FormData();
      ["fullName","phone","password","confirmPassword","cnicNumber",
       "currentAddress","fatherSpouseName","dateOfBirth","gender",
       "maritalStatus","employmentType","preferredCity","maxTravelDistance",
      ].forEach(k => payload.append(k, form[k]));
      ["services","daysAvailable","preferredWorkingHours"].forEach(k => {
        form[k].forEach(item => payload.append(k, item));
      });
      payload.append("cnicFrontImage", cnicFront);
      payload.append("adminCreated", "true");

      await api.post("/workers/register", payload);
      onSuccess("Worker account created and verified successfully!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create worker account.");
    } finally {
      setLoading(false);
    }
  };

  // ── Dynamic input class (turns red on field error) ────────────────────────
  const inp = (key) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-white ${
      fieldErrors[key]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
    }`;

  const sel = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "95vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F172A] px-4 py-4 sm:p-5 text-white shrink-0 sm:rounded-t-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black">Create Worker Account</h2>
              <p className="text-slate-400 text-xs mt-0.5 leading-snug">
                Account will be automatically verified — no admin review needed.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 overscroll-contain">
          <div className="p-4 sm:p-6 space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Personal Information ── */}
            <div>
              <SectionTitle>Personal Information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Full Name *</label>
                  <input
                    className={inp("fullName")}
                    placeholder="Full name"
                    value={form.fullName}
                    onKeyDown={blockNonAlpha}
                    onChange={e => setField("fullName", e.target.value)}
                  />
                  {fieldErrors.fullName
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
                    : <p className="text-xs text-slate-400 mt-1">Letters only</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Father/Spouse Name *</label>
                  <input
                    className={inp("fatherSpouseName")}
                    placeholder="Father or Spouse name"
                    value={form.fatherSpouseName}
                    onKeyDown={blockNonAlpha}
                    onChange={e => setField("fatherSpouseName", e.target.value)}
                  />
                  {fieldErrors.fatherSpouseName
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.fatherSpouseName}</p>
                    : <p className="text-xs text-slate-400 mt-1">Letters only</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Date of Birth *</label>
                  <input
                    className={inp("dateOfBirth")}
                    type="date"
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
                    : <p className="text-xs text-slate-400 mt-1">Worker must be 18–60 years old</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Gender *</label>
                  <select className={sel} value={form.gender} onChange={e => set("gender", e.target.value)}>
                    {["Male","Female","Other"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Marital Status</label>
                  <select className={sel} value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)}>
                    {["Single","Married","Divorced","Widowed"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">CNIC * (35202-XXXXXXX-X)</label>
                  <input
                    className={inp("cnicNumber")}
                    placeholder="35202-XXXXXXX-X"
                    maxLength={15}
                    value={form.cnicNumber}
                    onChange={e => setField("cnicNumber", e.target.value)}
                  />
                  {fieldErrors.cnicNumber
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.cnicNumber}</p>
                    : <p className="text-xs text-slate-400 mt-1">Must start with 35202</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Phone * (03XX-XXXXXXX)</label>
                  <input
                    className={inp("phone")}
                    placeholder="03XX-XXXXXXX"
                    maxLength={12}
                    value={form.phone}
                    onChange={e => setField("phone", e.target.value)}
                  />
                  {fieldErrors.phone
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                    : <p className="text-xs text-slate-400 mt-1">Must start with 03</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Current Address *</label>
                  <input
                    className={inp("currentAddress")}
                    placeholder="e.g. House 5, Street 3, Lahore"
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
                    : <p className="text-xs text-slate-400 mt-1">Must contain letters</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Password *</label>
                  <input
                    className={inp("password")}
                    type="password"
                    placeholder="Min 8 chars + special character"
                    value={form.password}
                    onChange={e => setField("password", e.target.value)}
                  />
                  {fieldErrors.password
                    ? <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                    : <p className="text-xs text-slate-400 mt-1">Min 8 chars with !@#$%^&*</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Confirm Password *</label>
                  <input
                    className={inp("confirmPassword")}
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={e => setField("confirmPassword", e.target.value)}
                  />
                  {fieldErrors.confirmPassword &&
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* ── Services ── */}
            <div>
              <SectionTitle>Services (select at least 1) *</SectionTitle>
              {fieldErrors.services && (
                <p className="text-xs text-red-500 mb-2">{fieldErrors.services}</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {serviceList.map(s => {
                  const active = form.services.includes(s._id);
                  return (
                    <button
                      key={s._id} type="button"
                      onClick={() => toggleArr("services", s._id)}
                      className={`flex flex-col items-center gap-1 px-1 py-2.5 sm:py-3 rounded-xl border-2 text-[10px] sm:text-xs font-bold text-center transition-all ${
                        active
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <ServiceIcon name={s.name} active={active} />
                      <span className="leading-tight">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Availability ── */}
            <div>
              <SectionTitle>Availability *</SectionTitle>
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-5">

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-2 block">Available Days *</label>
                    {fieldErrors.daysAvailable && (
                      <p className="text-xs text-red-500 mb-1">{fieldErrors.daysAvailable}</p>
                    )}
                    <div className="flex gap-1.5 flex-wrap">
                      {DAYS_SHORT.map((d, i) => {
                        const full = DAYS_FULL[i];
                        const active = form.daysAvailable.includes(full);
                        return (
                          <button
                            key={d} type="button"
                            onClick={() => toggleArr("daysAvailable", full)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold border-2 transition-all ${
                              active
                                ? "bg-teal-500 border-teal-500 text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-2 block">Preferred Working Hours</label>
                    <div className="flex flex-col gap-1.5">
                      {WORKING_HOURS.map(h => {
                        const active = form.preferredWorkingHours.includes(h);
                        return (
                          <button
                            key={h} type="button"
                            onClick={() => toggleArr("preferredWorkingHours", h)}
                            className={`px-3 py-2 rounded-xl border-2 text-xs font-bold text-left flex items-center gap-2 transition-all ${
                              active
                                ? "border-teal-500 bg-teal-50 text-teal-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {active
                              ? <Check size={13} className="shrink-0" />
                              : <span className="w-[13px]" />
                            }
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Preferred City</label>
                    <select className={sel} value={form.preferredCity} onChange={e => set("preferredCity", e.target.value)}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Employment Type</label>
                    <select className={sel} value={form.employmentType} onChange={e => set("employmentType", e.target.value)}>
                      {EMP_TYPE.map(tp => <option key={tp}>{tp}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">
                      Max Travel Distance:{" "}
                      <span className="text-teal-600">{form.maxTravelDistance} km</span>
                    </label>
                    <input
                      type="range" min={1} max={100} step={1}
                      value={form.maxTravelDistance}
                      onChange={e => set("maxTravelDistance", Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>1 km</span><span>100 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CNIC Document ── */}
            <div>
              <SectionTitle>CNIC Document *</SectionTitle>
              {fieldErrors.cnicFront && (
                <p className="text-xs text-red-500 mb-2">{fieldErrors.cnicFront}</p>
              )}
              <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-5 sm:p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all">
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => setCnicFront(e.target.files[0])} />
                {cnicFront ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={28} className="text-teal-500" />
                    <p className="text-sm font-semibold text-teal-600 break-all">{cnicFront.name}</p>
                    <p className="text-xs text-slate-400">Tap to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={26} className="text-slate-300" />
                    <p className="text-sm font-bold text-teal-600">Tap to upload CNIC front image</p>
                    <p className="text-xs text-slate-400">JPG, PNG or WEBP</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading
                ? "Creating…"
                : <><CheckCircle size={16} /> Create & Verify</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}