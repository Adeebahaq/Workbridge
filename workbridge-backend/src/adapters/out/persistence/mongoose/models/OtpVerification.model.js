const mongoose = require("mongoose");

const OtpVerificationSchema = new mongoose.Schema(
  { phone:    { type: String, required: true,
                match: [/^03[0-9]{2}-[0-9]{7}$/, "Phone must be 03XX-XXXXXXX"] },
    otpHash:  { type: String, required: true },
    deliveryChannel: { type: String, enum: ["whatsapp"], default: "whatsapp" },
    attempts: { type: Number, required: true, default: 0, min: 0, max: 3 },
    expiresAt: { type: Date, required: true },          // TTL field — 2 minutes
    resendAvailableAt: { type: Date },
    verified:  { type: Boolean, default: false } },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "otp_verifications" }
);

OtpVerificationSchema.index({ phone: 1 },    { name: "idx_otp_phone" });
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_otp_ttl" });

module.exports = mongoose.model("OtpVerification", OtpVerificationSchema);
