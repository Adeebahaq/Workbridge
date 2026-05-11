import React from "react";
import { PartyPopper } from "lucide-react";
import PendingRow from "./PendingRow";

export default function VerifyTab({ pending, dataLoading, onSelectWorker }) {
  return (
    <div className="w-full max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Verify Workers</h1>
        <p className="text-sm text-slate-400">Review and approve pending worker profiles</p>
      </div>

      {dataLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-2 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="w-20 h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 sm:p-16 text-center">
          <div className="flex justify-center mb-4"><PartyPopper size={48} className="text-teal-400" /></div>
          <p className="font-black text-slate-700 text-base mb-1">No pending verifications</p>
          <p className="text-slate-400 text-sm">All worker submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(w => (
            <PendingRow key={w._id} worker={w} onReview={onSelectWorker} />
          ))}
        </div>
      )}
    </div>
  );
}