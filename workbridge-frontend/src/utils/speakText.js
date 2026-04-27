/**
 * speakText — Web Speech API utility
 * Speaks the given text aloud using the language-appropriate voice.
 *
 * @param {string} text      - The text to speak
 * @param {string} language  - i18n language code ("en" or "ur")
 */
export function speakText(text, language) {
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis is not supported in this browser.");
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "ur" ? "ur-PK" : "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  const applyVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language === "ur" ? "ur" : "en";
    const match = voices.find((v) => v.lang.startsWith(langPrefix));
    if (match) utterance.voice = match;
    window.speechSynthesis.speak(utterance);
  };

  // Voices may not be loaded yet on the very first call
  if (window.speechSynthesis.getVoices().length > 0) {
    applyVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      applyVoiceAndSpeak();
    };
  }
}
