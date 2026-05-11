const multer = require("multer");
const cloudinary = require("../../../../infrastructure/config/cloudinary");
const { Readable } = require("stream");

const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const audioUpload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
};

module.exports = { upload, audioUpload, uploadToCloudinary };