import React, { useEffect, useState } from "react";
import api from "../../services/api";

function Field({ label, value, half = false }) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium min-h-[40px] flex items-center">
        {value ?? <span className="text-slate-300">—</span>}
      </div>
    </div>
  );
}

function EditField({ label, name, value, onChange, half = false, type = "text", readOnly = false, placeholder = "" }) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium outline-none transition-all min-h-[40px]
          ${readOnly
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-white border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          }`}
      />
    </div>
  );
}

function PricingField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">PKR</span>
        <input
          type="number"
          name={name}
          value={value || ""}
          onChange={onChange}
          min={0}
          placeholder="0"
          className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-700 font-medium outline-none bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
        />
      </div>
    </div>
  );
}

export default function WorkerProfile() {
  const [profile,        setProfile]        = useState(null);
  const [editing,        setEditing]        = useState(false);
  const [editingPricing, setEditingPricing] = useState(false);
  const [form,           setForm]           = useState({});
  const [pricing,        setPricing]        = useState({ hourlyRate: "", dailyRate: "", weeklyRate: "", monthlyRate: "" });
  const [saving,         setSaving]         = useState(false);
  const [savingPricing,  setSavingPricing]  = useState(false);
  const [toast,          setToast]          = useState(null);
  // ✅ Live completed jobs count
  const [completedCount, setCompletedCount] = useState(0);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get("/workers/me").then(p => {
      setProfile(p);
      setForm({
        fullName:          p.userId?.fullName    || "",
        phone:             p.userId?.phone       || "",
        currentAddress:    p.currentAddress      || "",
        preferredCity:     p.preferredCity       || "",
        maxTravelDistance: p.maxTravelDistance   || "",
      });
      const existingPricing = p.servicePricing?.[0] || {};
      setPricing({
        hourlyRate:  existingPricing.hourlyRate  || "",
        dailyRate:   existingPricing.dailyRate   || "",
        weeklyRate:  existingPricing.weeklyRate  || "",
        monthlyRate: existingPricing.monthlyRate || "",
      });
    }).catch(() => {});

    // ✅ Fetch actual jobs and count completed ones
    api.get("/jobs").then(jobs => {
      setCompletedCount(Array.isArray(jobs) ? jobs.filter(j => j.status === "Completed").length : 0);
    }).catch(() => setCompletedCount(0));
  }, []);

  const handleChange        = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePricingChange = e => setPricing(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/workers/availability", {
        currentAddress:    form.currentAddress,
        preferredCity:     form.preferredCity,
        maxTravelDistance: form.maxTravelDistance,
      });
      setProfile(p => ({ ...p, ...form }));
      setEditing(false);
      showToast("Profile updated!");
    } catch (e) {
      showToast(e.message || "Update failed", "error");
    } finally { setSaving(false); }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      const rates = {
        hourlyRate:  pricing.hourlyRate  ? Number(pricing.hourlyRate)  : undefined,
        dailyRate:   pricing.dailyRate   ? Number(pricing.dailyRate)   : undefined,
        weeklyRate:  pricing.weeklyRate  ? Number(pricing.weeklyRate)  : undefined,
        monthlyRate: pricing.monthlyRate ? Number(pricing.monthlyRate) : undefined,
      };
      await api.patch("/workers/pricing", { servicePricing: rates });
      setProfile(p => ({
        ...p,
        servicePricing: [{ ...rates, serviceId: p.services?.[0]?._id || p.services?.[0] }],
      }));
      setEditingPricing(false);
      showToast("Pricing updated! Employers will now see your rates.");
    } catch (e) {
      showToast(e.message || "Failed to save pricing", "error");
    } finally { setSavingPricing(false); }
  };

  const initials = (name = "") =>
    name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "W";

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 mt-3">Loading profile...</p>
      </div>
    </div>
  );

  const statusColor = {
    Active:                 "bg-green-100 text-green-700",
    "Pending Verification": "bg-yellow-100 text-yellow-700",
    Rejected:               "bg-red-100 text-red-700",
    Suspended:              "bg-orange-100 text-orange-700",
    Inactive:               "bg-gray-100 text-gray-500",
  }[profile.status] || "bg-gray-100 text-gray-500";

  const existingPricing = profile.servicePricing?.[0] || {};
  const hasPricing = existingPricing.hourlyRate || existingPricing.dailyRate ||
                     existingPricing.weeklyRate  || existingPricing.monthlyRate;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg text-white transition-all ${
          toast.type === "error" ? "bg-red-500" : "bg-teal-500"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-teal-500/15 flex items-center justify-center text-teal-600 font-black text-2xl shrink-0">
            {initials(profile.userId?.fullName)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-black text-slate-800">{profile.userId?.fullName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">📍 {profile.preferredCity}</p>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                {profile.availabilityBadge === "Available" ? "● AVAILABLE" : "● BUSY"}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                {profile.status}
              </span>
              {profile.status === "Active" && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                  ✓ CNIC Verified
                </span>
              )}
            </div>
            <div className="flex gap-6 mt-3 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-lg font-black text-slate-800">⭐ {profile.averageRating?.toFixed(1) || "0.0"}</p>
                <p className="text-[11px] text-slate-400">Rating</p>
              </div>
              <div className="text-center">
                {/* ✅ Now uses live count from /jobs */}
                <p className="text-lg font-black text-slate-800">{completedCount}</p>
                <p className="text-[11px] text-slate-400">Jobs Done</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-800">{profile.totalReviews || 0}</p>
                <p className="text-[11px] text-slate-400">Reviews</p>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50">
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          👤 Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {editing ? (
            <>
              <EditField label="Full Name *"               name="fullName"           value={form.fullName}           onChange={handleChange} half readOnly />
              <EditField label="WhatsApp Number *"         name="phone"              value={form.phone}              onChange={handleChange} half readOnly />
              <EditField label="Current Address *"         name="currentAddress"     value={form.currentAddress}     onChange={handleChange} />
              <EditField label="Preferred City *"          name="preferredCity"      value={form.preferredCity}      onChange={handleChange} half />
              <EditField label="Max Travel Distance (km)"  name="maxTravelDistance"  value={form.maxTravelDistance}  onChange={handleChange} half type="number" />
            </>
          ) : (
            <>
              <Field label="Full Name"            value={profile.userId?.fullName} half />
              <Field label="WhatsApp Number"      value={profile.userId?.phone}    half />
              <Field label="Current Address"      value={profile.currentAddress} />
              <Field label="Preferred City"       value={profile.preferredCity}    half />
              <Field label="Max Travel Distance"  value={profile.maxTravelDistance ? `${profile.maxTravelDistance} km` : "—"} half />
            </>
          )}
        </div>
      </div>

      {/* Work Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          🗂 Work Information
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Employment Type" value={profile.employmentType}                                    half />
          <Field label="Gender"          value={profile.gender}                                            half />
          <Field label="CNIC Number"     value={profile.cnicNumber} />
          <Field label="Days Available"  value={profile.daysAvailable?.join(", ")} />
          <Field label="Services"        value={Array.isArray(profile.services) ? profile.services.map(s => s?.name || s).join(", ") : "—"} />
        </div>
      </div>

      {/* SERVICE PRICING */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              💰 Service Pricing
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set your rates so employers see the estimated cost before hiring you.
            </p>
          </div>
          {!editingPricing ? (
            <button
              onClick={() => setEditingPricing(true)}
              className="border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 shrink-0"
            >
              {hasPricing ? "✏️ Edit Rates" : "➕ Set Rates"}
            </button>
          ) : (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setEditingPricing(false)}
                className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePricing}
                disabled={savingPricing}
                className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                {savingPricing ? "Saving..." : "Save Rates"}
              </button>
            </div>
          )}
        </div>

        {editingPricing ? (
          <div className="grid grid-cols-2 gap-3">
            <PricingField label="Hourly Rate  (PKR / hr)"  name="hourlyRate"  value={pricing.hourlyRate}  onChange={handlePricingChange} />
            <PricingField label="Daily Rate   (PKR / day)" name="dailyRate"   value={pricing.dailyRate}   onChange={handlePricingChange} />
            <PricingField label="Weekly Rate  (PKR / wk)"  name="weeklyRate"  value={pricing.weeklyRate}  onChange={handlePricingChange} />
            <PricingField label="Monthly Rate (PKR / mo)"  name="monthlyRate" value={pricing.monthlyRate} onChange={handlePricingChange} />
            <div className="col-span-2">
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
                💡 Leave a field blank if you don't offer that hiring type. Employers will only see rates you've set.
              </p>
            </div>
          </div>
        ) : (
          <>
            {hasPricing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Hourly",  key: "hourlyRate",  unit: "/hr"  },
                  { label: "Daily",   key: "dailyRate",   unit: "/day" },
                  { label: "Weekly",  key: "weeklyRate",  unit: "/wk"  },
                  { label: "Monthly", key: "monthlyRate", unit: "/mo"  },
                ].map(({ label, key, unit }) => (
                  <div key={key} className={`rounded-xl p-3 text-center border ${existingPricing[key] ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-100"}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                    {existingPricing[key] ? (
                      <>
                        <p className="text-base font-black text-teal-700">
                          PKR {Number(existingPricing[key]).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-teal-500">{unit}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-300 font-semibold">Not set</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-2xl mb-2">💰</p>
                <p className="text-sm font-semibold text-slate-500">No rates set yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Set Rates" to add your pricing. Employers won't see a cost estimate until you do.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          🔐 Verification Status
        </h3>
        <div className={`flex items-center gap-4 p-4 rounded-2xl ${
          profile.status === "Active" ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
            profile.status === "Active" ? "bg-green-100" : "bg-yellow-100"
          }`}>
            {profile.status === "Active" ? "✅" : "⏳"}
          </div>
          <div>
            <p className={`text-sm font-bold ${profile.status === "Active" ? "text-green-700" : "text-yellow-700"}`}>
              {profile.status === "Active" ? "CNIC Verified — Account Active" : profile.status}
            </p>
            <p className={`text-xs mt-0.5 ${profile.status === "Active" ? "text-green-600" : "text-yellow-600"}`}>
              {profile.status === "Active"
                ? "Your profile has been reviewed and approved by admin."
                : "Your profile is under review. Admin will verify within 48 hours."}
            </p>
          </div>
        </div>
        {profile.adminRejectionReason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <strong>Rejection Reason:</strong> {profile.adminRejectionReason}
          </div>
        )}
      </div>
    </div>
  );
}