const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const UPLOAD_DIR = "uploads/";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE_MB = 10;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// for images
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPEG and PNG images are allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// for audio
const audioUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only audio files are allowed"), false);
  },
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload, audioUpload };