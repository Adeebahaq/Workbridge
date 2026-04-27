const { generateOtp, hashOtp } = require("../../../shared/utils/otpGenerator");
const OTP                      = require("../../../domain/value-objects/OTP");
const AppError                 = require("../../../shared/errors/AppError");

class ResendOtpUseCase {
  constructor(userRepository, otpRepository, whatsAppOtpService) {
    this.userRepository     = userRepository;
    this.otpRepository      = otpRepository;
    this.whatsAppOtpService = whatsAppOtpService;
  }

  async execute({ phone }) {
    if (!phone) throw new AppError("Phone is required", 400);

    const user = await this.userRepository.findByPhone(phone.trim());
    if (!user) throw new AppError("Phone not registered", 404);
    if (user.isWhatsappVerified) throw new AppError("Phone is already verified", 400);

    const existing = await this.otpRepository.findByPhone(phone.trim());
    if (existing && new Date() < new Date(existing.resendAvailableAt)) {
      const seconds = Math.ceil((new Date(existing.resendAvailableAt) - Date.now()) / 1000);
      throw new AppError(`Please wait ${seconds}s before requesting a new OTP`, 429);
    }

    await this.otpRepository.deleteByPhone(phone.trim());

    const otp     = generateOtp();
    const otpHash = await hashOtp(otp);
    await this.otpRepository.save({
      phone: phone.trim(),
      otpHash,
      expiresAt:         OTP.expiresAt(),
      resendAvailableAt: OTP.resendAvailableAt(),
    });

    await this.whatsAppOtpService.sendOtp(phone.trim(), otp);
    return { message: "New OTP sent via WhatsApp" };
  }
}

module.exports = ResendOtpUseCase;