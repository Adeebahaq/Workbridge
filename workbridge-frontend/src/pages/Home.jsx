import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import SpeakerButton from "../components/ui/SpeakerButton";
import {
  Home as HomeIcon,
  Car,
  Leaf,
  Baby,
  ChefHat,
  Zap,
  Wrench,
  Shield,
  Sparkles,
  Shirt,
  CarFront,
  HeartHandshake,
  ShieldCheck,
  Volume2,
  Gift,
  BarChart2,
  Scale,
  UserCircle,
  Search,
  FolderOpen,
  Star,
  FileText,
  CheckCircle,
  Mail,
  DollarSign,
  Users,
  Briefcase,
  ThumbsUp,
  MapPin,
  CircleDot,
  CheckCircle2,
  Info,
  Globe,
  LifeBuoy,
  ScrollText,
} from "lucide-react";

// --- Constants & Config ---
const FALLBACK_SERVICES = [
  { _id: "Domestic Helpers", name: "Domestic Helpers" },
  { _id: "Drivers",          name: "Drivers" },
  { _id: "Gardeners",        name: "Gardeners" },
  { _id: "Babysitters",      name: "Babysitters" },
  { _id: "Cooks",            name: "Cooks" },
  { _id: "Electricians",     name: "Electricians" },
  { _id: "Plumbers",         name: "Plumbers" },
  { _id: "Security Guards",  name: "Security Guards" },
];

const SERVICE_ICONS = {
  "Domestic Helpers": HomeIcon,
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
const DEFAULT_SERVICE_ICON = Wrench;

const SERVICE_TRANS_KEYS = {
  "Domestic Helpers": { name: "services.domestic",     sub: "services.domestic_sub" },
  "Drivers":          { name: "services.drivers",      sub: "services.drivers_sub" },
  "Gardeners":        { name: "services.gardeners",    sub: "services.gardeners_sub" },
  "Babysitters":      { name: "services.babysitters",  sub: "services.babysitters_sub" },
  "Cooks":            { name: "services.cooks",        sub: "services.cooks_sub" },
  "Electricians":     { name: "services.electricians", sub: "services.electricians_sub" },
  "Plumbers":         { name: "services.plumbers",     sub: "services.plumbers_sub" },
  "Security Guards":  { name: "services.security",     sub: "services.security_sub" },
};

const REVIEW_KEYS = [
  { name: "Ali Mahmood", roleKey: "reviews.role1", textKey: "reviews.text1", stars: 5 },
  { name: "Sara Baig",   roleKey: "reviews.role2", textKey: "reviews.text2", stars: 5 },
  { name: "Fatima Asif", roleKey: "reviews.role3", textKey: "reviews.text3", stars: 5 },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq]               = useState(null);
  const [activeTab, setActiveTab]           = useState("employers");
  const [stats]                             = useState({ workers: "2,840", jobs: "183", match: "97%", rating: "4.9" });
  const [services, setServices]             = useState(FALLBACK_SERVICES);
  const [workers, setWorkers]               = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [showAllWorkers, setShowAllWorkers] = useState(false);

  useEffect(() => {
    api.get("/services")
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) setServices(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/workers/verified")
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list)) setWorkers(list);
      })
      .catch(() => {})
      .finally(() => setWorkersLoading(false));
  }, []);

  // --- Data Arrays ---
  const WHY_FEATURES = [
    { Icon: ShieldCheck, titleKey: "why.cnic_title",     descKey: "why.cnic_desc" },
    { Icon: Volume2,     titleKey: "why.urdu_title",     descKey: "why.urdu_desc" },
    { Icon: Zap,         titleKey: "why.realtime_title", descKey: "why.realtime_desc" },
    { Icon: Gift,        titleKey: "why.free_title",     descKey: "why.free_desc" },
    { Icon: BarChart2,   titleKey: "why.ratings_title",  descKey: "why.ratings_desc" },
    { Icon: Scale,       titleKey: "why.dispute_title",  descKey: "why.dispute_desc" },
  ];

  const STEPS = activeTab === "employers" ? [
    { Icon: UserCircle, num: 1, titleKey: "how.emp_step1_title", descKey: "how.emp_step1_desc" },
    { Icon: Search,     num: 2, titleKey: "how.emp_step2_title", descKey: "how.emp_step2_desc" },
    { Icon: FolderOpen, num: 3, titleKey: "how.emp_step3_title", descKey: "how.emp_step3_desc" },
    { Icon: Star,       num: 4, titleKey: "how.emp_step4_title", descKey: "how.emp_step4_desc" },
  ] : [
    { Icon: FileText,    num: 1, titleKey: "how.wrk_step1_title", descKey: "how.wrk_step1_desc" },
    { Icon: CheckCircle, num: 2, titleKey: "how.wrk_step2_title", descKey: "how.wrk_step2_desc" },
    { Icon: Mail,        num: 3, titleKey: "how.wrk_step3_title", descKey: "how.wrk_step3_desc" },
    { Icon: DollarSign,  num: 4, titleKey: "how.wrk_step4_title", descKey: "how.wrk_step4_desc" },
  ];

  const FAQS = [
    { qKey: "faq.q1", aKey: "faq.a1" },
    { qKey: "faq.q2", aKey: "faq.a2" },
    { qKey: "faq.q3", aKey: "faq.a3" },
    { qKey: "faq.q4", aKey: "faq.a4" },
  ];

  const DASHBOARD_ROWS = [
    { Icon: Users,     labelKey: "hero.active_workers", val: stats.workers, subKey: "hero.week_change" },
    { Icon: Briefcase, labelKey: "hero.jobs_today",     val: stats.jobs,    subKey: "hero.day_change" },
    { Icon: ThumbsUp,  labelKey: "hero.match_rate",     val: stats.match,   subKey: "hero.match_label" },
  ];

  const HERO_BADGES = ["hero.badge_cnic", "hero.badge_urdu", "hero.badge_free", "hero.badge_48hr"];

  // Shared worker card renderer
  const renderWorkerCard = (worker) => {
    const name           = worker.userId?.fullName || "Worker";
    const workerInitials = name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
    const city           = worker.preferredCity || "Pakistan";
    const badge          = worker.availabilityBadge || "Available";
    const rating         = worker.averageRating ? worker.averageRating.toFixed(1) : null;
    const jobs           = worker.totalCompletedJobs || 0;
    const serviceNames   = (worker.services || []).map(s => s?.name || s).filter(Boolean).slice(0, 2);
    const employmentType = worker.employmentType || "";
    const badgeLabel     = badge === "Available" ? t("workers.available") : t("workers.busy");

    const handleHire = () => {
      if (!user) navigate("/login");
      else if (user.role === "employer") navigate("/employer/workers");
      else navigate("/login");
    };

    return (
      <div key={worker._id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">
            {workerInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm text-[#0F172A] truncate">{name}</div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={11} /> {city}
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            badge === "Available" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
          }`}>
            {badgeLabel}
          </span>
        </div>

        {/* Services */}
        {serviceNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {serviceNames.map((s, i) => {
              const SvcIcon = SERVICE_ICONS[s] || DEFAULT_SERVICE_ICON;
              return (
                <span key={i} className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                  <SvcIcon size={11} /> {s}
                </span>
              );
            })}
            {employmentType && (
              <span className="text-[11px] font-semibold bg-teal-50 text-teal-600 px-2.5 py-0.5 rounded-full">
                {employmentType}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {rating && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-slate-600">{rating}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase size={11} />
            {jobs} {t("workers.jobs_done")}
          </span>
        </div>

        {/* Hire Button */}
        <button
          onClick={handleHire}
          className="mt-auto w-full bg-[#0F172A] hover:bg-teal-600 text-white text-sm font-bold py-2.5 rounded-xl border-none cursor-pointer transition-colors"
        >
          {user?.role === "employer" ? t("workers.hire_btn") : t("workers.hire")}
        </button>
      </div>
    );
  };

  return (
    <div className="font-sans text-[#0F172A] bg-white pt-20">

      {/* ── HERO ── */}
      <section className="bg-[#F8FAFC] pt-10 pb-16 px-6">
        <div dir="ltr" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div dir="auto" style={{ textAlign: i18n.language === "ur" ? "right" : "left" }}>

            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-bold text-slate-500 tracking-widest uppercase mb-6">
              <CircleDot size={12} className="text-teal-500" />
              {t("hero.badge")}
              <SpeakerButton textKey="hero.badge" />
            </div>

            <div className="flex items-start gap-2 mb-5">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05]">
                {t("hero.title_line1")}<br />
                <span className="text-teal-500">{t("hero.title_line2")}</span>
              </h1>
              <SpeakerButton
                text={`${t("hero.title_line1")} ${t("hero.title_line2")}. ${t("hero.subtitle")}`}
                className="mt-2 shrink-0"
              />
            </div>

            <p className="text-slate-500 text-base leading-relaxed max-w-md mb-8">{t("hero.subtitle")}</p>

            <div className={`flex flex-wrap gap-3 mb-8 ${i18n.language === "ur" ? "flex-row-reverse" : ""}`}>
              <button
                onClick={() => navigate("/login")}
                className="bg-[#0F172A] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-slate-800 transition-all cursor-pointer border-none"
              >
                {t("hero.btn_need_workers")}
              </button>
              <button
                onClick={() => navigate("/register/worker")}
                className="bg-white text-[#0F172A] font-bold px-6 py-3 rounded-xl text-sm border-2 border-[#0F172A] hover:bg-slate-50 transition-all cursor-pointer"
              >
                {t("hero.btn_find_work")}
              </button>
            </div>

            <div className={`flex gap-4 flex-wrap ${i18n.language === "ur" ? "flex-row-reverse" : ""}`}>
              {HERO_BADGES.map((key) => (
                <span key={key} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <CheckCircle2 size={14} className="text-teal-500" />
                  {t(key)}
                </span>
              ))}
              <SpeakerButton text={HERO_BADGES.map(k => t(k)).join(", ")} />
            </div>
          </div>

          {/* Right — Dashboard Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 relative">
            <div className="absolute top-6 right-6">
              <SpeakerButton
                text={`${t("hero.dashboard_title")}. ${DASHBOARD_ROWS.map(r => `${t(r.labelKey)}: ${r.val}`).join(". ")}`}
              />
            </div>
            <div className="mb-5">
              <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">{t("hero.dashboard_label")}</div>
              <div className="text-base font-black text-[#0F172A]">{t("hero.dashboard_title")}</div>
            </div>
            {DASHBOARD_ROWS.map(({ Icon, labelKey, val, subKey }) => (
              <div key={labelKey} className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold text-slate-400 mb-0.5">{t(labelKey)}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#0F172A]">{val}</span>
                    <span className="text-xs font-bold text-teal-500">{t(subKey)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ── */}
      <section className="py-20 px-6 bg-white" id="why">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-4xl font-black">{t("why.title")}</h2>
            <SpeakerButton text={`${t("why.title")}. ${t("why.subtitle")}`} />
          </div>
          <p className="text-slate-500 text-base max-w-xl mx-auto mb-14">{t("why.subtitle")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-left">
            {WHY_FEATURES.map(({ Icon, titleKey, descKey }) => (
              <div key={titleKey} className="bg-slate-50 rounded-2xl p-5 hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4">
                  <SpeakerButton text={`${t(titleKey)}. ${t(descKey)}`} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
                  <Icon size={20} />
                </div>
                <div className="font-black text-sm text-[#0F172A] mb-1.5">{t(titleKey)}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{t(descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 bg-slate-50" id="how">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-10">
            <h2 className="text-4xl font-black">{t("how.title")}</h2>
            <SpeakerButton text={t("how.title")} />
          </div>

          <div className="inline-flex bg-white rounded-xl p-1 border border-slate-200 mb-12">
            <button
              onClick={() => setActiveTab("employers")}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg border-none cursor-pointer transition-all ${activeTab === "employers" ? "bg-[#0F172A] text-white" : "text-slate-500 bg-transparent"}`}
            >
              {t("how.tab_employers")}
            </button>
            <button
              onClick={() => setActiveTab("workers")}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg border-none cursor-pointer transition-all ${activeTab === "workers" ? "bg-[#0F172A] text-white" : "text-slate-500 bg-transparent"}`}
            >
              {t("how.tab_workers")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map(({ Icon, num, titleKey, descKey }) => (
              <div key={num} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 relative">
                <div className="absolute top-2 right-2">
                  <SpeakerButton text={`${t(titleKey)}. ${t(descKey)}`} />
                </div>
                <div className="absolute -top-3 left-4 w-7 h-7 rounded-lg bg-[#0F172A] text-white text-xs font-black flex items-center justify-center">
                  {num}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mx-auto mb-4 mt-2">
                  <Icon size={28} />
                </div>
                <div className="font-black text-sm mb-2">{t(titleKey)}</div>
                <div className="text-slate-400 text-xs leading-relaxed">{t(descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 px-6 bg-white" id="services">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <h2 className="text-4xl font-black">{t("services.title")}</h2>
              <SpeakerButton text={t("services.title")} />
            </div>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-bold text-teal-600 hover:text-teal-800 bg-transparent border-none cursor-pointer"
            >
              {t("services.browse_all")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {services.map(({ name, _id }) => {
              const keys          = SERVICE_TRANS_KEYS[name] || SERVICE_TRANS_KEYS[_id];
              const displayName   = keys ? t(keys.name) : name;
              const displaySub    = keys ? t(keys.sub)  : name;
              const IconComponent = SERVICE_ICONS[name] || SERVICE_ICONS[_id] || DEFAULT_SERVICE_ICON;
              return (
                <div
                  key={name}
                  onClick={() => navigate("/login")}
                  className="bg-slate-50 rounded-2xl p-5 hover:bg-teal-50 hover:shadow-md transition-all cursor-pointer relative group"
                >
                  <div className="absolute top-4 right-4">
                    <SpeakerButton text={`${displayName}. ${displaySub}`} />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-teal-600 mb-3 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-all">
                    <IconComponent size={22} />
                  </div>
                  <div className="font-black text-sm text-[#0F172A] group-hover:text-teal-700 mb-1">{displayName}</div>
                  <div className="text-slate-400 text-xs">{displaySub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VERIFIED WORKERS ── */}
      <section className="py-20 px-6 bg-slate-50" id="workers">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-[#0F172A] mb-2">{t("workers.title")}</h2>
            <p className="text-slate-500 text-sm">{t("workers.subtitle")}</p>
          </div>

          {workersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                      <div className="h-2 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded" />
                    <div className="h-2 bg-slate-100 rounded w-4/5" />
                  </div>
                  <div className="h-9 bg-slate-200 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-slate-300" />
              </div>
              <p className="font-semibold">{t("workers.no_workers")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {(showAllWorkers ? workers : workers.slice(0, 3)).map(renderWorkerCard)}
              </div>

              {workers.length > 3 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowAllWorkers(prev => !prev)}
                    className="bg-[#0F172A] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-teal-600 transition-colors border-none cursor-pointer"
                  >
                    {showAllWorkers
                      ? t("workers.show_less")
                      : `${t("workers.browse_more")} (${workers.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-12">
            <h2 className="text-4xl font-black">{t("reviews.title")}</h2>
            <SpeakerButton text={`${t("reviews.title")}. ${t("reviews.rating_summary")}`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEW_KEYS.map(({ name, roleKey, textKey, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-6 text-left shadow-sm border border-slate-100 relative">
                <div className="absolute top-6 right-6">
                  <SpeakerButton text={`${t(textKey)}. Reviewed by ${name}, ${t(roleKey)}`} />
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array(stars).fill(null).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{t(textKey)}"</p>
                <div>
                  <div className="font-black text-sm text-[#0F172A]">{name}</div>
                  <div className="text-xs text-slate-400 font-semibold">{t(roleKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-20 px-6 bg-white" id="faqs">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-12">
            <h2 className="text-4xl font-black">{t("faq.title")}</h2>
            <SpeakerButton text={t("faq.title")} />
          </div>

          <div className="space-y-3">
            {FAQS.map(({ qKey, aKey }, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-slate-50 transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="text-left font-semibold text-sm text-[#0F172A] border-none bg-transparent cursor-pointer flex-1"
                  >
                    {t(qKey)}
                  </button>
                  <div className="flex items-center gap-3">
                    <SpeakerButton text={`${t(qKey)}. ${t(aKey)}`} />
                    <span className="text-teal-500 font-black text-lg">{openFaq === i ? "−" : "+"}</span>
                  </div>
                </div>
                {openFaq === i && (
                  <div className="px-6 pb-5 border-t border-slate-100 pt-4 bg-white text-slate-500 text-sm leading-relaxed">
                    {t(aKey)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F172A] py-14 px-6 text-slate-500" id="footer">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-800 pb-10 mb-6">
          <div className="relative group">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white font-black">Work<span className="text-teal-400">Bridge</span></span>
              <SpeakerButton text={`${t("footer.tagline")} ${t("footer.tagline_sub")}`} />
            </div>
            <p className="text-xs leading-relaxed">{t("footer.tagline")}<br />{t("footer.tagline_sub")}</p>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">{t("footer.quick_links")}</h4>
            <ul className="text-xs space-y-2 list-none p-0">
              <li className="flex items-center gap-1.5"><Info size={11} /> {t("footer.about_us")}</li>
              <li className="flex items-center gap-1.5"><Globe size={11} /> {t("footer.services")}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">{t("footer.support")}</h4>
            <ul className="text-xs space-y-2 list-none p-0">
              <li className="flex items-center gap-1.5"><LifeBuoy size={11} /> {t("footer.help_center")}</li>
              <li className="flex items-center gap-1.5"><ScrollText size={11} /> {t("footer.terms")}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">{t("footer.contact")}</h4>
            <div className="text-xs space-y-2">
              <p className="flex items-center gap-1.5"><MapPin size={11} /> Lahore, Pakistan</p>
              <p className="flex items-center gap-1.5"><Mail size={11} /> support@workbridge.pk</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs flex items-center gap-2">
            {t("footer.copyright")} <SpeakerButton text={t("footer.copyright")} />
          </div>
          <div className="text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> {t("footer.systems_ok")}
          </div>
        </div>
      </footer>
    </div>
  );
}