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

    if (OTP.maxAttemptsReached(record.attempts)) {
      throw new AppError("Too many failed attempts. Please request a new OTP.", 400);
    }

    await this.otpRepository.incrementAttempts(record._id);

    const valid = await verifyOtp(otp.toString().trim(), record.otpHash);
    if (!valid) throw new AppError("Invalid OTP. Please try again.", 400);

    await this.otpRepository.deleteByPhone(phone.trim());
    await this.userRepository.updateByPhone(phone.trim(), { isWhatsappVerified: true });

    return { message: "Phone verified successfully. You can now log in." };
  }
}

module.exports = VerifyOtpUseCase;