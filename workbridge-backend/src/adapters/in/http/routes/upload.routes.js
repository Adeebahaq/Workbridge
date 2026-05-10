const express = require("express");
const router = express.Router();
const { audioUpload, uploadToCloudinary } = require("../middlewares/upload.middleware");

router.post("/audio", audioUpload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No audio file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "workbridge/audio",
      resource_type: "video",
    });

    const duration = parseFloat(req.body.duration) || 0;
    res.json({ url: result.secure_url, duration });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

module.exports = router;