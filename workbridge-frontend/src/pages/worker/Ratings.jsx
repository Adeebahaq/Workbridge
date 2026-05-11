import React, { useEffect, useState } from "react";
import { Star, TrendingUp, Users, Award } from "lucide-react";
import api from "../../services/api";
import StarRating from "../../components/ui/StarRating";

function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function WorkerRatings() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("workers/ratings")
      .then(setData)
      .catch(() => setData({ averageRating: 0, totalReviews: 0, ratings: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 mt-3">Loading ratings...</p>
      </div>
    </div>
  );

  const { averageRating = 0, totalReviews = 0, ratings = [] } = data || {};

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: ratings.filter(r => r.stars === star).length,
    pct:   totalReviews > 0 ? (ratings.filter(r => r.stars === star).length / totalReviews) * 100 : 0,
  }));

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400" />
          My Ratings
        </h1>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        {/* Stack vertically on mobile, horizontal on sm+ */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          {/* Big number */}
          <div className="text-center shrink-0">
            <p className="text-5xl sm:text-6xl font-black text-slate-800">{Number(averageRating).toFixed(1)}</p>
            <StarRating value={Math.round(averageRating)} readOnly size={18} />
            <p className="text-xs text-slate-400 mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
          </div>

          {/* Bar distribution */}
          <div className="w-full flex-1 space-y-2">
            {dist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-4 text-right">{star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-4 border-t border-slate-100">
          {[
            { icon: Star,  color: "text-amber-500",  label: "Avg Rating",    value: Number(averageRating).toFixed(1) },
            { icon: Users, color: "text-teal-500",   label: "Total Reviews", value: totalReviews                     },
            { icon: Award, color: "text-indigo-500", label: "5-Star",        value: dist[0].count                   },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className="text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <p className="text-lg sm:text-xl font-black text-slate-800">{value}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {ratings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 sm:p-12 text-center">
          <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold text-sm">No ratings yet</p>
          <p className="text-slate-400 text-xs mt-1">
            Complete jobs and employers will rate your work here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            All Reviews
          </p>
          {ratings.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <StarRating value={r.stars} readOnly size={16} />
                  {r.feedback && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed break-words">
                      "{r.feedback}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-2">{timeAgo(r.submittedAt)}</p>
                </div>
                <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <span className="text-amber-500 font-black text-sm">{r.stars}★</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}