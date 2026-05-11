import React, { useState, useEffect } from "react";
import { useWorkerSearch } from "../../hooks/useWorkerSearch";
import api from "../../services/api";

// ── Cost calculation engine ──────────────────────────────────────────────────
function calcCascadingCost(startDate, endDate, pricing) {
  if (!startDate || !endDate) return null;
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (e <= s) return null;

  // +1 = start day inclusive
  const totalDays = Math.ceil((e - s) / (24 * 3600 * 1000)) + 1;

  const monthRate = Number(pricing.monthlyRate) || 0;
  const weekRate  = Number(pricing.weeklyRate)  || 0;
  const dayRate   = Number(pricing.dailyRate)   || 0;

  let remaining = totalDays;
  const breakdown = [];

  if (monthRate > 0 && remaining >= 30) {
    const months = Math.floor(remaining / 30);
    breakdown.push({ label: `${months} month${months>1?"s":""}`, qty: months, rate: monthRate, unit: "mo", cost: months * monthRate });
    remaining -= months * 30;
  }
  if (weekRate > 0 && remaining >= 7) {
    const weeks = Math.floor(remaining / 7);
    breakdown.push({ label: `${weeks} week${weeks>1?"s":""}`, qty: weeks, rate: weekRate, unit: "wk", cost: weeks * weekRate });
    remaining -= weeks * 7;
  }
  if (dayRate > 0 && remaining > 0) {
    breakdown.push({ label: `${remaining} day${remaining>1?"s":""}`, qty: remaining, rate: dayRate, unit: "day", cost: remaining * dayRate });
    remaining = 0;
  }

  if (breakdown.length === 0) return null;
  const total = breakdown.reduce((sum, b) => sum + b.cost, 0);
  return { breakdown, total, totalDays, uncovered: remaining };
}

// Add min days to a date string → returns "YYYY-MM-DD"
function addDays(dateStr, days) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ── Cost Breakdown Card ──────────────────────────────────────────────────────
function CostBreakdown({ breakdown, total, totalDays, uncovered, label }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Cost Breakdown{totalDays ? ` — ${totalDays} ${label || "days"} total` : ""}
      </p>
      <div className="space-y-1.5">
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${i===0?"bg-teal-500":i===1?"bg-blue-400":"bg-amber-400"}`}/>
              <span className="text-slate-600 font-semibold">{b.label}</span>
              <span className="text-slate-400">@ PKR {Number(b.rate).toLocaleString()}/{b.unit}</span>
            </div>
            <span className="font-black text-slate-800">PKR {b.cost.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black">
        <span className="text-slate-700">Total Estimate</span>
        <span className="text-teal-600">PKR {total.toLocaleString()}</span>
      </div>
      {uncovered > 0 && (
        <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
          ⚠ {uncovered} day{uncovered>1?"s":""} not priced — worker missing some rate types
        </p>
      )}
    </div>
  );
}

// ── Dark Summary Card ────────────────────────────────────────────────────────
function DarkCostCard({ hiringType, breakdown, total }) {
  return (
    <div className="bg-[#0F172A] rounded-xl p-4">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Estimated Cost</p>
      <p className="text-white font-black text-2xl mt-1">PKR {total.toLocaleString()}</p>
      <p className="text-slate-400 text-xs">{breakdown.map(b=>b.label).join(" + ")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800 text-xs">
        <div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1.5">⊙ SUMMARY</p>
          <div className="space-y-1">
            {breakdown.map((b,i)=>(
              <div key={i} className="flex justify-between">
                <span className="text-slate-400">{b.label}</span>
                <span className="text-white font-semibold">PKR {b.cost.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
              <span className="text-slate-300 font-bold">Total</span>
              <span className="text-teal-400 font-black">PKR {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1.5">⊙ HOW IT WORKS</p>
          <ol className="space-y-0.5 text-slate-400">
            <li>1. Request is sent</li>
            <li>2. Worker reviews it</li>
            <li>3. 24h to respond</li>
            <li>4. Job starts on date</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ── Worker Profile Modal ─────────────────────────────────────────────────────
function WorkerProfileModal({ worker, onClose, onHire }) {
  const [tab, setTab] = useState("about");
  const name = worker.userId?.fullName || "Worker";
  const initials = name.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase();
  const isAvailable = worker.availabilityBadge === "Available";
  const serviceNames = (worker.services||[]).map(s=>s.name||s).join(", ");
  const pricing = worker.servicePricing?.[0] || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col sm:flex-row" onClick={e=>e.stopPropagation()}>
        <div className="w-full sm:w-56 sm:shrink-0 bg-[#0F172A] flex flex-col p-5 gap-3 overflow-y-auto">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xl">{initials}</div>
          <div>
            <p className="text-white font-black text-base leading-tight">{name}</p>
            <p className="text-slate-400 text-xs mt-0.5">{isAvailable?"🟢 AVAILABLE NOW":"🔴 BUSY"}</p>
            <p className="text-slate-400 text-xs mt-1">📍 {worker.preferredCity||"—"}</p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {(worker.services||[]).map((s,i)=>(
              <span key={i} className="text-[10px] font-bold bg-slate-800 text-teal-400 px-2 py-0.5 rounded-full uppercase tracking-wide">{s.name||s}</span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-white font-black">{worker.averageRating?.toFixed(1)||"0.0"}</span>
            <span className="text-slate-400 text-xs">({worker.totalReviews||0})</span>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <div><p className="text-white font-black text-sm">{worker.totalCompletedJobs||0}</p><p>JOBS DONE</p></div>
            <div><p className="text-white font-black text-sm">≈1h</p><p>RESPONSE</p></div>
          </div>
          {worker.cnicFrontImage&&(
            <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2 py-1 rounded-lg">✓ CNIC VERIFIED</span>
          )}
          {(pricing.hourlyRate||pricing.dailyRate||pricing.weeklyRate||pricing.monthlyRate)&&(
            <div className="border-t border-slate-800 pt-3 space-y-1">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">$ SERVICE RATES</p>
              {pricing.hourlyRate  && <div className="flex justify-between text-xs"><span className="text-slate-400">Hourly</span><span className="text-white">PKR {Number(pricing.hourlyRate).toLocaleString()}/hr</span></div>}
              {pricing.dailyRate   && <div className="flex justify-between text-xs"><span className="text-slate-400">Daily</span><span className="text-white">PKR {Number(pricing.dailyRate).toLocaleString()}/day</span></div>}
              {pricing.weeklyRate  && <div className="flex justify-between text-xs"><span className="text-slate-400">Weekly</span><span className="text-white">PKR {Number(pricing.weeklyRate).toLocaleString()}/wk</span></div>}
              {pricing.monthlyRate && <div className="flex justify-between text-xs"><span className="text-slate-400">Monthly</span><span className="text-white">PKR {Number(pricing.monthlyRate).toLocaleString()}/mo</span></div>}
            </div>
          )}
          <button onClick={()=>onHire(worker)} className="mt-auto w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-2.5 rounded-xl text-sm transition-all">
            HIRE {name.split(" ")[0].toUpperCase()}
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-100 sticky top-0 bg-white z-10">
            {["about","reviews"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} className={`flex-1 py-3 text-xs font-bold capitalize transition-all ${tab===t?"border-b-2 border-teal-500 text-teal-600":"text-slate-400 hover:text-slate-600"}`}>
                {t==="about"?"About":"Reviews & Ratings"}
              </button>
            ))}
            <button onClick={onClose} className="px-4 text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {tab==="about"&&(
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">☆ ABOUT {name.split(" ")[0].toUpperCase()}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{serviceNames?`Experienced ${serviceNames.toLowerCase()} worker based in ${worker.preferredCity||"Pakistan"}. Available ${worker.employmentType||"full-time"}.`:"Professional worker available for hire."}</p>
                </div>
                {worker.daysAvailable?.length>0&&(
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Availability</p>
                    <div className="flex flex-wrap gap-1">{(worker.daysAvailable||[]).map(d=><span key={d} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">{d.slice(0,3)}</span>)}</div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Employment Type</p>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">{worker.employmentType||"—"}</span>
                </div>
              </div>
            )}
            {tab==="reviews"&&(
              <div className="space-y-4">
                <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-4xl font-black text-slate-800">{worker.averageRating?.toFixed(1)||"0.0"}</p>
                    <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(i=><span key={i} className={`text-sm ${i<=Math.round(worker.averageRating||0)?"text-amber-400":"text-slate-200"}`}>★</span>)}</div>
                    <p className="text-xs text-slate-400 mt-0.5">{worker.totalReviews||0} REVIEWS</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5,4,3,2,1].map(star=>(
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-3">{star}★</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{width:star===5?"70%":star===4?"20%":"5%"}}/></div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">Reviews from verified hires</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hire Modal ───────────────────────────────────────────────────────────────
function HireModal({ worker, onClose, onSuccess }) {
  const name      = worker.userId?.fullName || "Worker";
  const initials  = name.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase();
  const pricing   = worker.servicePricing?.[0] || {};
  const serviceId = worker.services?.[0]?._id || worker.services?.[0];
  const today     = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    hiringType:  "Daily",
    jobDate:     "",
    hours:       1,
    days:        1,
    startDate:   "",
    endDate:     "",
    location:    "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  const setErr = (field) => {
    setErrors(e => ({ ...e, [field]: true }));
    setTimeout(() => {
      document.getElementById(`field-${field}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };
  const clearErr = (field) => setErrors(e => ({ ...e, [field]: false }));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const hourlyRate = Number(pricing.hourlyRate) || 0;
  const dailyRate  = Number(pricing.dailyRate)  || 0;

  const hourlyBreakdown = form.hiringType === "Hourly" && hourlyRate > 0 && form.hours > 0
    ? { breakdown: [{ label: `${form.hours} hour${form.hours>1?"s":""}`, rate: hourlyRate, unit: "hr", cost: form.hours * hourlyRate }], total: form.hours * hourlyRate }
    : null;

  const dailyBreakdown = form.hiringType === "Daily" && dailyRate > 0 && form.days > 0
    ? { breakdown: [{ label: `${form.days} day${form.days>1?"s":""}`, rate: dailyRate, unit: "day", cost: form.days * dailyRate }], total: form.days * dailyRate }
    : null;

  const needsDates = ["Weekly", "Monthly"].includes(form.hiringType);
  const cascading  = needsDates ? calcCascadingCost(form.startDate, form.endDate, pricing) : null;

  const minEndDate = form.hiringType === "Weekly"
    ? addDays(form.startDate, 6)
    : form.hiringType === "Monthly"
      ? addDays(form.startDate, 29)
      : today;

  const maxEndDate = form.hiringType === "Weekly"
    ? addDays(form.startDate, 28)
    : undefined;

  const totalCost =
    form.hiringType === "Hourly" ? (hourlyBreakdown?.total || 0) :
    form.hiringType === "Daily"  ? (dailyBreakdown?.total  || 0) :
    (cascading?.total || 0);

  const jobDateForApi = needsDates ? form.startDate : form.jobDate;

  const handleSubmit = async () => {
    // validate in order — scroll to first missing field
    if (form.hiringType === "Hourly" && !form.jobDate)  { setErr("jobDate");   return; }
    if (form.hiringType === "Daily"  && !form.jobDate)  { setErr("jobDate");   return; }
    if (needsDates && !form.startDate)                  { setErr("startDate"); return; }
    if (needsDates && !form.endDate)                    { setErr("endDate");   return; }
    if (!form.location)                                 { setErr("location");  return; }

    setSubmitting(true);
    try {
      await api.post("/employers/jobs", {
  workerId:      worker.userId?._id,
  serviceId,
  hiringType:    form.hiringType,
  jobDate:       jobDateForApi,
  startDate:     needsDates ? form.startDate : undefined,
  endDate:       needsDates ? form.endDate   : undefined,
  quantity:      form.hiringType === "Hourly" ? form.hours
               : form.hiringType === "Daily"  ? form.days
               : undefined,
  description:   `${form.location}${form.description ? " — " + form.description : ""}`,
  estimatedCost: totalCost,
});
      onSuccess();
    } catch (e) {
      setErrors(ev => ({ ...ev, submit: true, submitMsg: e.message || "Failed to send request" }));
      setTimeout(() => document.getElementById("field-submit")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-1">JOB REQUEST</p>
          <h2 className="text-xl font-black text-slate-800">Send Job Request</h2>
          <p className="text-sm text-slate-400">Fill in the details and we'll notify the worker instantly.</p>
          <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-600 font-black text-xs">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm">{name}</p>
              <p className="text-xs text-slate-400">📍 {worker.preferredCity} · ⭐ {worker.averageRating?.toFixed(1)||"0.0"}</p>
            </div>
            <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full">{worker.availabilityBadge}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[62vh]">

          {/* Hiring Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hiring Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {["Hourly","Daily","Weekly","Monthly"].map(t=>(
                <button key={t} onClick={()=>{ set("hiringType",t); setErrors({}); }}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-0.5 ${
                    form.hiringType===t ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}>
                  <span className="text-base">{t==="Hourly"?"⏰":t==="Daily"?"📅":t==="Weekly"?"📋":"🗓"}</span>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {form.hiringType === "Hourly"  && "Select up to 23 hours. For a full day or more use Daily."}
              {form.hiringType === "Daily"   && "Select 1–6 days. For a full week or more use Weekly."}
              {form.hiringType === "Weekly"  && "Select 7–29 days. For a full month or more use Monthly."}
              {form.hiringType === "Monthly" && "Minimum 30 days. For longer durations add more months, weeks or days."}
            </p>
          </div>

          {/* ── HOURLY ── */}
          {form.hiringType === "Hourly" && (
            <div className="space-y-3">
              <div id="field-jobDate">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Date *</label>
                <input type="date" value={form.jobDate} min={today}
                  onChange={e=>{ set("jobDate",e.target.value); clearErr("jobDate"); }}
                  className={`mt-1.5 w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.jobDate ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-teal-400"}`}
                />
                {errors.jobDate && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ This field is required</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Number of Hours * <span className="text-slate-300 font-normal">(max 23)</span>
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <button onClick={()=>set("hours", Math.max(1, form.hours-1))}
                    className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-50 flex items-center justify-center">−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-black text-slate-800">{form.hours}</span>
                    <span className="text-sm text-slate-400 ml-1">hour{form.hours>1?"s":""}</span>
                  </div>
                  <button onClick={()=>set("hours", Math.min(23, form.hours+1))}
                    className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-50 flex items-center justify-center">+</button>
                </div>
                <input type="range" min={1} max={23} value={form.hours}
                  onChange={e=>set("hours", Number(e.target.value))}
                  className="w-full mt-2 accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 hr</span><span>23 hrs max</span>
                </div>
              </div>
              {hourlyBreakdown && form.jobDate && (
                <CostBreakdown {...hourlyBreakdown} totalDays={form.hours} label="hours" />
              )}
            </div>
          )}

          {/* ── DAILY ── */}
          {form.hiringType === "Daily" && (
            <div className="space-y-3">
              <div id="field-jobDate">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date *</label>
                <input type="date" value={form.jobDate} min={today}
                  onChange={e=>{ set("jobDate",e.target.value); clearErr("jobDate"); }}
                  className={`mt-1.5 w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.jobDate ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-teal-400"}`}
                />
                {errors.jobDate && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ This field is required</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Number of Days * <span className="text-slate-300 font-normal">(max 6)</span>
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <button onClick={()=>set("days", Math.max(1, form.days-1))}
                    className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-50 flex items-center justify-center">−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-black text-slate-800">{form.days}</span>
                    <span className="text-sm text-slate-400 ml-1">day{form.days>1?"s":""}</span>
                  </div>
                  <button onClick={()=>set("days", Math.min(6, form.days+1))}
                    className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-50 flex items-center justify-center">+</button>
                </div>
                <input type="range" min={1} max={6} value={form.days}
                  onChange={e=>set("days", Number(e.target.value))}
                  className="w-full mt-2 accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 day</span><span>6 days max</span>
                </div>
              </div>
              {dailyBreakdown && form.jobDate && (
                <CostBreakdown {...dailyBreakdown} totalDays={form.days} label="days" />
              )}
            </div>
          )}

          {/* ── WEEKLY / MONTHLY ── */}
          {needsDates && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div id="field-startDate">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date *</label>
                  <input type="date" value={form.startDate} min={today}
                    onChange={e=>{ set("startDate",e.target.value); set("endDate",""); clearErr("startDate"); }}
                    className={`mt-1.5 w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.startDate ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-teal-400"}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ This field is required</p>}
                </div>
                <div id="field-endDate">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    End Date *
                    <span className="text-slate-400 normal-case font-normal ml-1">
                      {form.hiringType==="Weekly" ? "(min 7 days)" : "(min 30 days)"}
                    </span>
                  </label>
                  <input type="date" value={form.endDate}
                    min={minEndDate || today}
                    max={maxEndDate || undefined}
                    disabled={!form.startDate}
                    onChange={e=>{ set("endDate",e.target.value); clearErr("endDate"); }}
                    className={`mt-1.5 w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      errors.endDate ? "border-red-400 focus:ring-red-200"
                      : !form.startDate ? "opacity-40 cursor-not-allowed border-slate-200"
                      : "border-slate-200 focus:ring-teal-400"
                    }`}
                  />
                  {!form.startDate && <p className="text-[10px] text-slate-400 mt-1">Select start date first</p>}
                  {errors.endDate && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ This field is required</p>}
                </div>
              </div>
              {cascading && <CostBreakdown {...cascading} />}
              {form.startDate && form.endDate && !cascading && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                  ⚠ Worker hasn't set rates for this period — cost cannot be estimated.
                </p>
              )}
            </div>
          )}

          {/* Location */}
          <div id="field-location">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location / Address *</label>
            <input value={form.location} onChange={e=>{ set("location",e.target.value); clearErr("location"); }}
              placeholder="House No., Street, Area, City"
              className={`mt-1.5 w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.location ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-teal-400"}`}
            />
            {errors.location && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ This field is required</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
              Job Description <span className="text-slate-400 normal-case font-normal">(Max 300 chars)</span>
            </label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)}
              maxLength={300} rows={3} placeholder="Describe the job..."
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
          </div>

          {/* Dark cost cards */}
          {form.hiringType === "Hourly" && hourlyBreakdown && form.jobDate && (
            <DarkCostCard hiringType={form.hiringType} breakdown={hourlyBreakdown.breakdown} total={hourlyBreakdown.total} />
          )}
          {form.hiringType === "Daily" && dailyBreakdown && form.jobDate && (
            <DarkCostCard hiringType={form.hiringType} breakdown={dailyBreakdown.breakdown} total={dailyBreakdown.total} />
          )}
          {needsDates && cascading && (
            <DarkCostCard hiringType={form.hiringType} breakdown={cascading.breakdown} total={cascading.total} />
          )}

          {/* API submit error */}
          <div id="field-submit">
            {errors.submit && (
              <p className="text-red-500 text-sm font-semibold">⚠ {errors.submitMsg || "Failed to send request"}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100">
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-black py-3 rounded-xl text-sm transition-all">
            {submitting ? "Sending..." : "Send Job Request →"}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            Worker has 24 hours to accept or reject your request.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function FindWorkers() {
  const { workers, search, loading } = useWorkerSearch();
  const [services,   setServices]   = useState([]);
  const [filters,    setFilters]    = useState({ service:"", city:"", area:"", availability:"" });
  const [viewWorker, setViewWorker] = useState(null);
  const [hireWorker, setHireWorker] = useState(null);
  const [toast,      setToast]      = useState("");
  const set = (k,v) => setFilters(f=>({...f,[k]:v}));

  useEffect(()=>{ api.get("/services").then(setServices).catch(()=>{}); search({}); },[]);

  const handleApply = () => {
    const p = {};
    if (filters.service)      p.serviceId         = filters.service;
    if (filters.city)         p.preferredCity     = filters.city;
    if (filters.area)         p.preferredArea     = filters.area;
    if (filters.availability) p.availabilityBadge = filters.availability;
    search(p);
  };
  const handleClear = () => { setFilters({service:"",city:"",area:"",availability:""}); search({}); };
  const showToast   = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const CITIES = ["Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar"];

  return (
    <div className="min-h-screen bg-slate-50">
      {toast&&<div className="fixed top-5 right-5 z-50 bg-teal-500 text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl">{toast}</div>}

      {viewWorker&&!hireWorker&&<WorkerProfileModal worker={viewWorker} onClose={()=>setViewWorker(null)} onHire={w=>{setViewWorker(null);setHireWorker(w);}}/>}
      {hireWorker&&<HireModal worker={hireWorker} onClose={()=>setHireWorker(null)} onSuccess={()=>{setHireWorker(null);showToast("✅ Job request sent!");}}/>}

    <div className="flex flex-col md:flex-row gap-5 p-3 md:p-6 max-w-6xl mx-auto">
      <div className="w-full md:w-52 md:shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">🔍 Filters</div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SERVICE</label>
              <select value={filters.service} onChange={e=>set("service",e.target.value)} className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option value="">All Services</option>
                {services.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CITY</label>
              <select value={filters.city} onChange={e=>set("city",e.target.value)} className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option value="">All Cities</option>
                {CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AREA</label>
              <select value={filters.area} onChange={e=>set("area",e.target.value)} className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option value="">All Areas</option>
                {["DHA","Gulberg","Johar Town","Bahria Town","Model Town"].map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AVAILABILITY</label>
              <div className="mt-2 space-y-1.5">
                {[["","All Workers"],["Available","Available"],["Busy","Busy"]].map(([val,label])=>(
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="avail" value={val} checked={filters.availability===val} onChange={()=>set("availability",val)} className="accent-teal-500"/>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      {val==="Available"&&<span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>}
                      {val==="Busy"&&<span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>}
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleApply} className="w-full bg-[#0F172A] hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all">Apply</button>
            <button onClick={handleClear} className="w-full text-slate-400 hover:text-slate-600 text-xs font-semibold py-1 transition-all">Clear</button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div>
              <h1 className="text-xl font-black text-slate-800">Find Workers</h1>
              <p className="text-sm text-slate-400">Browse verified workers in your area</p>
            </div>
            {!loading&&<span className="text-xs font-semibold text-slate-500">{workers.length} verified worker{workers.length!==1?"s":""} found</span>}
          </div>

          {loading&&(
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
              <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mr-3"/>Searching workers...
            </div>
          )}
          {!loading&&workers.length===0&&(
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-semibold">No workers found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
            {workers.map(w=>{
              const wname=w.userId?.fullName||"Worker";
              const winit=wname.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase();
              const isAvail=w.availabilityBadge==="Available";
              const svcs=(w.services||[]).map(s=>s.name||s).join(", ");
              return (
                <div key={w._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">{winit}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-slate-800 text-sm">{wname}</p>
                          <p className="text-xs text-slate-400 truncate">{svcs||"—"}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-amber-400 text-xs">★</span>
                            <span className="text-xs font-bold text-slate-700">{w.averageRating?.toFixed(1)||"0.0"}</span>
                            <span className="text-xs text-slate-400">({w.totalReviews||0})</span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full border ${isAvail?"bg-emerald-50 text-emerald-600 border-emerald-200":"bg-red-50 text-red-500 border-red-200"}`}>
                          ⊙ {w.availabilityBadge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <span>📍 {w.preferredCity}</span><span>·</span><span>{w.totalCompletedJobs||0} jobs</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                    <button onClick={()=>setViewWorker(w)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">View</button>
                    <button onClick={()=>setHireWorker(w)} className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 rounded-xl text-xs font-black text-white transition-all">Hire</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}