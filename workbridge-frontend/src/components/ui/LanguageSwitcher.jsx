import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * LanguageSwitcher — toggles between English (LTR) and Urdu (RTL).
 * Updates document dir attribute automatically.
 */
export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();
  const isUrdu = i18n.language === "ur";

  // Keep <html dir> in sync with selected language
  useEffect(() => {
    document.documentElement.dir = isUrdu ? "rtl" : "ltr";
    document.documentElement.lang = isUrdu ? "ur" : "en";
  }, [isUrdu]);

  const toggle = () => {
    const next = isUrdu ? "en" : "ur";
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch language"
      className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-sm font-bold transition-all duration-200 whitespace-nowrap min-w-[90px] justify-center
        ${isUrdu
          ? "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
        } ${className}`}
    >
      <span className="text-base leading-none">{isUrdu ? "🇵🇰" : "🇬🇧"}</span>
      <span>{t("lang_switcher.label")}</span>
    </button>
  );
}
