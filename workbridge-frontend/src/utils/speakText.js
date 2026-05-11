let currentAudio = null;

export async function speakText(text, language) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tts/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) throw new Error("TTS request failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    currentAudio = new Audio(url);
    currentAudio.play();

    currentAudio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
    };
  } catch (err) {
    console.error("speakText error:", err);
  }
}