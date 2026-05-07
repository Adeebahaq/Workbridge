const { verifyOtp } = require("../../../shared/utils/otpGenerator");
const OTP           = require("../../../domain/value-objects/OTP");
const AppError      = require("../../../shared/errors/AppError");

class VerifyOtpUseCase {
  constructor(userRepository, otpRepository) {
    this.userRepository = userRepository;
    this.otpRepository  = otpRepository;
  }

  async execute({ phone, otp }) {
    if (!phone || !otp) throw new AppError("Phone and OTP are required", 400);

    const record = await this.otpRepository.findByPhone(phone.trim());
    if (!record) throw new AppError("OTP expired or not found. Please request a new one.", 400);

    // FR4: check expiry explicitly (belt-and-suspenders over TTL index)
    if (OTP.isExpired(record.expiresAt)) {
      await this.otpRepository.deleteByPhone(phone.trim());
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    // FR4: check max attempts BEFORE incrementing
    if (OTP.maxAttemptsReached(record.attempts)) {
      throw new AppError(`Too many failed attempts (max ${OTP.MAX_ATTEMPTS}). Please request a new OTP.`, 400);
    }

    // Only increment on an actual wrong attempt — validate first
    const valid = await verifyOtp(otp.toString().trim(), record.otpHash);

    if (!valid) {
      // increment attempts on wrong OTP
      const updated = await this.otpRepository.incrementAttempts(record._id);

      // after increment, check if max now reached
      if (OTP.maxAttemptsReached(updated.attempts)) {
        await this.otpRepository.deleteByPhone(phone.trim());
        throw new AppError("Too many failed attempts. Please request a new OTP.", 400);
      }

      const remaining = OTP.MAX_ATTEMPTS - updated.attempts;
      throw new AppError(`Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`, 400);
    }

    // OTP is correct — clean up and verify user
    await this.otpRepository.deleteByPhone(phone.trim());
    await this.userRepository.updateByPhone(phone.trim(), { isWhatsappVerified: true });

    return { message: "Phone verified successfully. You can now log in." };
  }
}

module.exports = VerifyOtpUseCase;