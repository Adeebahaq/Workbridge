const express = require("express");
const { EdgeTTS } = require("node-edge-tts");  // ← named import, not default
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const router = express.Router();

router.post("/speak", async (req, res) => {
  const { text, language } = req.body;

  if (!text || !language)
    return res.status(400).json({ error: "text and language are required" });

  const voice =
    language === "ur" ? "ur-PK-UzmaNeural" : "en-US-JennyNeural";

  const outputPath = path.join(__dirname, `tts_${randomUUID()}.mp3`);

  try {
    const tts = new EdgeTTS({
      voice: voice,
      lang: language === "ur" ? "ur-PK" : "en-US",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    });

    await tts.ttsPromise(text, outputPath);

    res.set("Content-Type", "audio/mpeg");
    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    stream.on("end", () => fs.unlinkSync(outputPath));
    stream.on("error", () => fs.existsSync(outputPath) && fs.unlinkSync(outputPath));

  } catch (err) {
    console.error("TTS error:", err.message);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).json({ error: "TTS request failed" });
  }
});

module.exports = router;