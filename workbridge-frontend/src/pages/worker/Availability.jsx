import React, { useEffect, useState } from "react";
import api from "../../services/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Gujranwala", "Sialkot", "Peshawar", "Quetta",
];

export default function Availability() {
  const [profile, setProfile]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [toast, setToast]       = useState(null);

  const [badge, setBadge]           = useState("Available");
  const [selectedDays, setDays]     = useState([]);
  const [startTime, setStartTime]   = useState("08:00 AM");
  const [endTime, setEndTime]       = useState("05:00 PM");
  const [city, setCity]             = useState("Lahore");
  const [maxTravel, setMaxTravel]   = useState(20);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get("/workers/me").then(p => {
      setProfile(p);
      setBadge(p.availabilityBadge || "Available");
      setCity(p.preferredCity || "Lahore");
      setMaxTravel(p.maxTravelDistance || 20);
      // Map full day names to short
      const short = (p.daysAvailable || []).map(d => {
        const entry = Object.entries(DAY_FULL).find(([, full]) => full === d);
        return entry ? entry[0] : d.slice(0, 3);
      });
      setDays(short);
    }).catch(() => {});
  }, []);

  const toggleDay = (day) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      showToast("Select at least one available day.", "error");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/workers/availability", {
        availabilityBadge: badge,
        preferredCity:     city,
        maxTravelDistance: Number(maxTravel),
        daysAvailable:     selectedDays.map(d => DAY_FULL[d]),
      });
      setSaved(true);
      showToast("Availability updated successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      showToast(e.message || "Update failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg text-white transition-all ${toast.type === "error" ? "bg-red-500" : "bg-teal-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">Availability & Location</h1>
        <p className="text-sm text-slate-500 mt-1">Let employers know when and where you're available for work.</p>
      </div>

      {/* Status Badge */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Availability Status</h3>
        <div className="flex gap-3">
          {["Available", "Busy"].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setBadge(opt)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                badge === opt
                  ? opt === "Available"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-400 bg-red-50 text-red-600"
                  : "border-slate-200 text-slate-400 hover:border-slate-300"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                opt === "Available" ? "bg-green-500" : "bg-red-400"
              }`} />
              {opt}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          {badge === "Available"
            ? "Employers can send you job requests."
            : "No new job requests while you're busy."}
        </p>
      </div>

      {/* Available Days */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Available Days *</h3>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                selectedDays.includes(day)
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        {selectedDays.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Selected: {selectedDays.map(d => DAY_FULL[d]).join(", ")}
          </p>
        )}
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Working Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Start Time</label>
            <div className="relative">
              <input
                type="time"
                value={startTime.includes(":") && !startTime.includes("AM") && !startTime.includes("PM")
                  ? startTime
                  : "08:00"}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">End Time</label>
            <div className="relative">
              <input
                type="time"
                value={endTime.includes(":") && !endTime.includes("AM") && !endTime.includes("PM")
                  ? endTime
                  : "17:00"}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Location & Travel</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Preferred City</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Max Travel (km)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxTravel}
              onChange={e => setMaxTravel(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        {/* Travel distance visual */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>1 km</span>
            <span className="font-semibold text-slate-600">{maxTravel} km selected</span>
            <span>100 km</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={maxTravel}
            onChange={e => setMaxTravel(e.target.value)}
            className="w-full accent-teal-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
          saved
            ? "bg-green-500 text-white"
            : "bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
        }`}
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        ) : saved ? (
          "✅ Saved Successfully!"
        ) : (
          "Save Availability"
        )}
      </button>

      
    </div>
  );
}