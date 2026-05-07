const express     = require("express");
const router      = express.Router();
const path        = require("path");
const { audioUpload } = require("../middlewares/upload.middleware");

router.post("/audio", audioUpload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No audio file uploaded" });
  const url = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
  // duration comes from frontend (MediaRecorder doesn't expose it server-side)
  const duration = parseFloat(req.body.duration) || 0;
  res.json({ url, duration });
});

module.exports = router;