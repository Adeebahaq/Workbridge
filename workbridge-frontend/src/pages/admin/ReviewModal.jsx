import React, { useState } from "react";
import { Phone, MapPin, XCircle, CheckCircle2, AlertTriangle, FileText, Lock, LockOpen, Undo2, Loader2 } from "lucide-react";
import { STATUS_META, fmt, initials } from "./Dashboard";
function ReviewModal({ worker, onClose, onAction }) {
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);

  const handle = async (action) => {
    if (action === "reject" && rejectReason.trim().length < 20) {
      alert("Rejection reason must be at least 20 characters.");
      return;
    }
    setLoading(true);
    await onAction(action, worker._id, rejectReason);
    setLoading(false);
  };

  const isPending = worker.status === "Pending Verification";
  const isActive  = worker.status === "Active";
  const meta = STATUS_META[worker.status] || STATUS_META["Inactive"];
  const name = worker.userId?.fullName || "Unknown";
  const charCount = rejectReason.trim().length;
  const rejectReady = charCount >= 20;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pt-20"
    onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F172A] p-6 text-white rounded-t-2xl shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Worker Review</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <XCircle size={14} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xl">
              {initials(name)}
            </div>
            <div>
              <h2 className="text-xl font-black">{name}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Phone size={12} /> {worker.userId?.phone}
                <span>·</span>
                <MapPin size={12} /> {worker.preferredCity}
              </p>
              <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${meta.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0">
          {["info", "services", "documents"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-xs font-bold capitalize transition-all ${activeTab === t ? "border-b-2 border-teal-500 text-teal-600" : "text-slate-400 hover:text-slate-600"}`}>
              {t === "info" ? "Personal Info" : t === "services" ? "Services & Availability" : "Documents"}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "info" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Full Name",       name],
                ["Phone",           worker.userId?.phone],
                ["CNIC",            worker.cnicNumber],
                ["Gender",          worker.gender],
                ["Date of Birth",   fmt(worker.dateOfBirth)],
                ["Marital Status",  worker.maritalStatus],
                ["Father/Spouse",   worker.fatherSpouseName],
                ["Current Address", worker.currentAddress],
                ["Preferred City",  worker.preferredCity],
                ["Employment Type", worker.employmentType],
                ["Submitted",       fmt(worker.submittedAt)],
                ["Max Travel",      worker.maxTravelDistance ? `${worker.maxTravelDistance} km` : "—"],
              ].map(([label, val]) => (
                <div key={label} className={label === "Current Address" ? "col-span-2" : ""}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl px-3 py-2">{val || "—"}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {(worker.services || []).map(s => (
                    <span key={s._id || s} className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-200">
                      {s.name || s}
                    </span>
                  ))}
                  {(!worker.services || worker.services.length === 0) && <span className="text-slate-400 text-sm">No services listed</span>}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Days</p>
                <div className="flex flex-wrap gap-2">
                  {(worker.daysAvailable || []).map(d => (
                    <span key={d} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preferred Working Hours</p>
                <div className="flex flex-wrap gap-2">
                  {(worker.preferredWorkingHours || []).map(h => (
                    <span key={h} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">{h}</span>
                  ))}
                  {(!worker.preferredWorkingHours || worker.preferredWorkingHours.length === 0) && (
                    <span className="text-slate-400 text-sm">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              {worker.cnicFrontImage?.url ? (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CNIC Front</p>
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/${worker.cnicFrontImage.url}`}
                    alt="CNIC Front"
                    className="w-full rounded-2xl border border-slate-200 object-cover max-h-48"
                    onError={e => { e.target.style.display = "none"; }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="flex justify-center mb-2">
                    <FileText size={36} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-semibold">No CNIC image uploaded</p>
                </div>
              )}
              {worker.adminRejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-700 mb-1">Previous Rejection Reason</p>
                  <p className="text-sm text-red-600">{worker.adminRejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions footer — always visible */}
        <div className="shrink-0 p-5 border-t border-slate-100 bg-slate-50 space-y-3 rounded-b-2xl">
          {isPending && (
            <>
              <div>
                <textarea
                  rows={2}
                  placeholder="Rejection reason (min 20 chars, required for reject only)"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                <div className="flex justify-between items-center mt-1 px-1">
                  <span className={`text-xs font-semibold flex items-center gap-1 ${rejectReady ? "text-green-600" : "text-red-500"}`}>
                    {rejectReady
                      ? <><CheckCircle2 size={12} /> Ready to reject</>
                      : <><AlertTriangle size={12} /> {20 - charCount} more characters needed to enable Reject</>}
                  </span>
                  <span className="text-xs text-slate-400">{charCount}/20</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handle("approve")} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button onClick={() => handle("reject")} disabled={loading || !rejectReady}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </>
          )}
          {isActive && (
            <button onClick={() => handle("suspend")} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
              <Lock size={14} /> Suspend Worker
            </button>
          )}
          {worker.status === "Suspended" && (
            <button onClick={() => handle("activate")} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
              <LockOpen size={14} /> Reactivate Worker
            </button>
          )}
          {worker.status === "Rejected" && (
            <button onClick={() => handle("approve")} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
              <Undo2 size={14} /> Approve Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default ReviewModal;