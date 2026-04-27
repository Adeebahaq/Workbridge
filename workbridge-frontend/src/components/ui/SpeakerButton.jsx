import React from "react";
import { useTranslation } from "react-i18next";
import { speakText } from "../../utils/speakText";

/**
 * SpeakerButton — reads aloud any translated text using the current language.
 *
 * Usage:
 *   <SpeakerButton textKey="hero.title_line1" />
 *   <SpeakerButton text={someComputedString} />
 *
 * Props:
 *   textKey  (string)  — i18n key to look up and speak
 *   text     (string)  — raw string to speak (use when key not available)
 *   className (string) — extra Tailwind classes for the button
 */
export default function SpeakerButton({ textKey, text, className = "" }) {
  const { t, i18n } = useTranslation();

  const handleSpeak = (e) => {
    e.stopPropagation();
    const content = textKey ? t(textKey) : text;
    speakText(content, i18n.language);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title="Read aloud"
      aria-label="Read aloud"
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600 transition-all duration-150 flex-shrink-0 border border-teal-100 hover:scale-110 active:scale-95 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  );
}
