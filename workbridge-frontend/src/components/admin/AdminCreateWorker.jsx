import React, { useState, useEffect } from "react";
import api from "../../services/api";

// ─── ENUMS — must match WorkerRegister + backend exactly ─────────────────────
const DAYS_FULL  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CITIES     = ["Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta"];
const EMP_TYPE   = ["Full-time","Part-time","On-call/Daily Basis"];

// These strings MUST match WorkerRegister's en/translation.json values:
//   hours_morning   → "Morning (6 AM - 2 PM)"
//   hours_afternoon → "Afternoon (12 PM - 6 PM)"
//   hours_evening   → "Evening (4 PM - 10 PM)"
//   hours_flexible  → "Flexible"
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

const SERVICE_ICONS = {
  "Domestic Helpers": "🏠", "Drivers": "🚗",       "Gardeners": "🌿",
  "Babysitters": "👶",      "Cooks": "🍳",          "Electricians": "⚡",
  "Plumbers": "🔧",         "Security Guards": "🛡️", "House Cleaning": "🧹",
  "Laundry/Ironing": "👔",  "Car Washing": "🚙",    "Elderly Care": "👴",
};

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

export default function AdminCreateWorker({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName: "", phone: "", password: "", confirmPassword: "",
    cnicNumber: "", currentAddress: "", fatherSpouseName: "",
    dateOfBirth: "", gender: "Male", maritalStatus: "Single",
    employmentType: "Full-time", preferredCity: "Lahore",
    maxTravelDistance: 20,
    services: [], daysAvailable: [], preferredWorkingHours: [],
  });

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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));

  const validate = () => {
    if (!form.fullName.trim())           return "Full name is required.";
    if (!form.fatherSpouseName.trim())   return "Father/Spouse name is required.";
    if (!form.dateOfBirth)               return "Date of birth is required.";
    if (!form.cnicNumber.trim())         return "CNIC number is required.";
    if (!/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(form.cnicNumber))
                                         return "CNIC format must be: 35202-XXXXXXX-X";
    if (!form.phone.trim())              return "Phone number is required.";
    if (!/^03[0-9]{2}-[0-9]{7}$/.test(form.phone))
                                         return "Phone format must be: 03XX-XXXXXXX";
    if (!form.currentAddress.trim())     return "Address is required.";
    if (!form.password)                  return "Password is required.";
    if (form.password.length < 8)        return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (form.services.length === 0)      return "Select at least one service.";
    if (form.daysAvailable.length === 0) return "Select at least one available day.";
    if (!cnicFront)                      return "CNIC front image is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setLoading(true);

    try {
      const payload = new FormData();

      // Scalar fields
      ["fullName","phone","password","confirmPassword","cnicNumber",
       "currentAddress","fatherSpouseName","dateOfBirth","gender",
       "maritalStatus","employmentType","preferredCity","maxTravelDistance",
      ].forEach(k => payload.append(k, form[k]));

      // Array fields — each value as a separate entry (matches WorkerRegister)
      ["services","daysAvailable","preferredWorkingHours"].forEach(k => {
        form[k].forEach(item => payload.append(k, item));
      });

      // CNIC image
      payload.append("cnicFrontImage", cnicFront);

      // adminCreated appended LAST — ensures multipart parser always sees it.
      // Backend RegisterWorkerUseCase checks: trimmed.adminCreated === "true"
      // This sets isPhoneVerified: true and status: "Active" on the new account.
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

  const inp = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all";
  const sel = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-[#0F172A] p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Create Worker Account</h2>
              <p className="text-slate-400 text-xs mt-0.5">Account will be automatically verified — no admin review needed.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>
            )}

            {/* Personal Information */}
            <div>
              <SectionTitle>Personal Information</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Full Name *</label>
                  <input className={inp} placeholder="Full name" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Father/Spouse Name *</label>
                  <input className={inp} placeholder="Father or Spouse name" value={form.fatherSpouseName} onChange={e => set("fatherSpouseName", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Date of Birth *</label>
                  <input className={inp} type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
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
                  <input className={inp} placeholder="35202-XXXXXXX-X" value={form.cnicNumber} onChange={e => set("cnicNumber", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Phone * (03XX-XXXXXXX)</label>
                  <input className={inp} placeholder="03XX-XXXXXXX" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Current Address *</label>
                  <input className={inp} placeholder="Full address" value={form.currentAddress} onChange={e => set("currentAddress", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Password *</label>
                  <input className={inp} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Confirm Password *</label>
                  <input className={inp} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <SectionTitle>Services (select at least 1) *</SectionTitle>
              <div className="grid grid-cols-4 gap-2">
                {serviceList.map(s => {
                  const active = form.services.includes(s._id);
                  return (
                    <button key={s._id} type="button" onClick={() => toggleArr("services", s._id)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                        active ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}>
                      <span className="text-xl">{SERVICE_ICONS[s.name] || "🔧"}</span>
                      <span className="leading-tight">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability */}
            <div>
              <SectionTitle>Availability *</SectionTitle>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-2 block">Available Days *</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {DAYS_SHORT.map((d, i) => {
                        const full = DAYS_FULL[i];
                        const active = form.daysAvailable.includes(full);
                        return (
                          <button key={d} type="button" onClick={() => toggleArr("daysAvailable", full)}
                            className={`w-10 h-10 rounded-lg text-xs font-bold border-2 transition-all ${
                              active ? "bg-teal-500 border-teal-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}>
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
                          <button key={h} type="button" onClick={() => toggleArr("preferredWorkingHours", h)}
                            className={`px-3 py-2 rounded-xl border-2 text-xs font-bold text-left transition-all ${
                              active ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}>
                            {active ? "✓ " : ""}{h}
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
                      Max Travel Distance: <span className="text-teal-600">{form.maxTravelDistance} km</span>
                    </label>
                    <input type="range" min={1} max={100} step={1}
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

            {/* CNIC Document */}
            <div>
              <SectionTitle>CNIC Document *</SectionTitle>
              <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={e => setCnicFront(e.target.files[0])} />
                {cnicFront ? (
                  <div>
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-sm font-semibold text-teal-600">{cnicFront.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-2 text-slate-300">📷</div>
                    <p className="text-sm font-bold text-teal-600">Click to upload CNIC front image</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG or WEBP</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
              {loading ? "Creating…" : "✓ Create & Verify Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}