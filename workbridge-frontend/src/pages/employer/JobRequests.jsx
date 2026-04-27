import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobManagement } from "../../hooks/useJobManagement";
import api from "../../services/api";

const STATUS_META = {
  Requested:              { color:"bg-amber-100 text-amber-700",   dot:"bg-amber-400",   label:"Pending"  },
  Accepted:               { color:"bg-blue-100 text-blue-700",     dot:"bg-blue-400",    label:"Accepted" },
  "In Progress":          { color:"bg-indigo-100 text-indigo-700", dot:"bg-indigo-400",  label:"In Progress" },
  "Awaiting Confirmation":{ color:"bg-purple-100 text-purple-700", dot:"bg-purple-400",  label:"Awaiting" },
  Completed:              { color:"bg-emerald-100 text-emerald-700",dot:"bg-emerald-500", label:"Completed"},
  Rejected:               { color:"bg-red-100 text-red-700",       dot:"bg-red-500",     label:"Rejected" },
  Cancelled:              { color:"bg-slate-100 text-slate-500",   dot:"bg-slate-400",   label:"Cancelled"},
  Expired:                { color:"bg-orange-100 text-orange-700", dot:"bg-orange-500",  label:"Expired"  },
};

// ── Rating Modal ─────────────────────────────────────────────────────────────
function RateModal({ job, onClose, onRate }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);
  const [brief, setBrief]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try { await onRate(job._id, rating, brief); onClose(); }
    catch(e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
        <h3 className="font-black text-slate-800 text-lg mb-1">Rate Worker</h3>
        <p className="text-xs text-slate-400 mb-4">How was your experience?</p>
        <div className="flex gap-1 justify-center mb-4">
          {[1,2,3,4,5].map(i=>(
            <button key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(i)}
              className={`text-3xl transition-all ${i<=(hover||rating)?"text-amber-400 scale-110":"text-slate-200"}`}>★</button>
          ))}
        </div>
        <textarea value={brief} onChange={e=>setBrief(e.target.value)} maxLength={200} rows={3} placeholder="Brief review (optional)"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"/>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={!rating||submitting}
            className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 rounded-xl text-sm font-black text-white transition-all">
            {submitting?"Submitting...":"Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key:"all",        label:"All Jobs"  },
  { key:"pending",    label:"Pending"   },
  { key:"inprogress", label:"In Progress"},
  { key:"completed",  label:"Completed" },
];

function fmtDate(d){ if(!d)return"—"; return new Date(d).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}); }

export default function JobRequests() {
  const navigate = useNavigate();
  const { jobs, fetchJobs, cancelJob, confirmJob } = useJobManagement();
  const [tab, setTab]         = useState("all");
  const [rateJob, setRateJob] = useState(null);
  const [toast, setToast]     = useState({ show:false, msg:"", type:"success" });

  useEffect(()=>{ fetchJobs(); },[]);

  const showToast = (msg,type="success") => { setToast({show:true,msg,type}); setTimeout(()=>setToast(t=>({...t,show:false})),3000); };

  const handleCancel = async (id) => {
    try { await cancelJob(id); await fetchJobs(); showToast("Job cancelled.","info"); }
    catch(e){ showToast(e.message||"Failed","error"); }
  };
  const handleConfirm = async (id) => {
    try { await confirmJob(id); await fetchJobs(); showToast("✅ Job confirmed as completed!"); }
    catch(e){ showToast(e.message||"Failed","error"); }
  };
 const handleRate = async (jobId, workerId, rating, brief) => {
  try {
    await api.post(`/employers/ratings`, {
      jobId,
      workerId,
      stars:    rating,
      feedback: brief,
    });
    await fetchJobs();
    showToast("⭐ Rating submitted!");
  } catch(e) { showToast(e.message || "Failed", "error"); }
};

  const filtered = jobs.filter(j=>{
    if(tab==="all")        return true;
    if(tab==="pending")    return ["Requested","Accepted"].includes(j.status);
    if(tab==="inprogress") return ["In Progress","Awaiting Confirmation"].includes(j.status);
    if(tab==="completed")  return ["Completed","Rejected","Cancelled","Expired"].includes(j.status);
    return true;
  });

  const counts = {
    all:jobs.length,
    pending:jobs.filter(j=>["Requested","Accepted"].includes(j.status)).length,
    inprogress:jobs.filter(j=>["In Progress","Awaiting Confirmation"].includes(j.status)).length,
    completed:jobs.filter(j=>["Completed","Rejected","Cancelled","Expired"].includes(j.status)).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {toast.show&&(
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white ${toast.type==="error"?"bg-red-500":toast.type==="info"?"bg-slate-600":"bg-teal-500"}`}>
          {toast.msg}
        </div>
      )}

      {rateJob&&<RateModal job={rateJob} onClose={()=>setRateJob(null)} onRate={handleRate}/>}

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-800">My Jobs</h1>
          <p className="text-sm text-slate-400">Track and manage your job requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 mb-5 shadow-sm w-fit">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${tab===t.key?"bg-[#0F172A] text-white":"text-slate-500 hover:text-slate-700"}`}>
              {t.label}
              {counts[t.key]>0&&(
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab===t.key?"bg-white/20 text-white":"bg-slate-100 text-slate-500"}`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Job list */}
        {filtered.length===0&&(
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="text-4xl mb-3">📋</span>
            <p className="font-semibold">No jobs here</p>
            <p className="text-sm mt-1">
              {tab==="all"?"You haven't sent any job requests yet.":"No jobs in this category."}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(j=>{
            const meta = STATUS_META[j.status]||STATUS_META["Expired"];
            const workerName = j.workerId?.fullName || j.workerId || "Worker";
            const workerInit = typeof workerName==="string" ? workerName.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase() : "W";
            const svcName = j.serviceId?.name || "Service";
            const cost = j.estimatedCost;
            const canChat = ["Accepted","In Progress","Awaiting Confirmation"].includes(j.status);
            const canRate = j.status==="Completed";
            const canConfirm = j.status==="Awaiting Confirmation";
            const canCancel = j.status==="Requested";

            return (
              <div key={j._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">{workerInit}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-slate-800 text-sm">{typeof workerName==="string"?workerName:"Worker"}</p>
                        <p className="text-xs text-slate-400">{svcName} · {j.hiringType} · {fmtDate(j.jobDate)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {cost>0&&<p className="font-black text-slate-800 text-sm">PKR {cost.toLocaleString()}</p>}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}/>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    {j.description&&<p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{j.description}</p>}
                  </div>
                </div>

                {(canCancel||canConfirm||canChat||canRate)&&(
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                    {canCancel&&(
                      <button onClick={()=>handleCancel(j._id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all">Cancel</button>
                    )}
                    {canConfirm&&(
                      <button onClick={()=>handleConfirm(j._id)} className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-black transition-all">✓ Confirm Done</button>
                    )}
                    {canChat&&(
                      <button onClick={()=>navigate(`/employer/chat/${j._id}`)} className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1">
                        💬 Chat
                      </button>
                    )}
                    {canRate&&(
                      <button onClick={()=>setRateJob(j)} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-bold transition-all flex items-center gap-1">
                        ★ Rate
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}