const { hashPassword }         = require("../../../shared/utils/hash");
const { generateOtp, hashOtp } = require("../../../shared/utils/otpGenerator");
const OTP                      = require("../../../domain/value-objects/OTP");
const AppError                 = require("../../../shared/errors/AppError");

class RegisterEmployerUseCase {
  constructor(userRepository, employerRepository, otpRepository, whatsAppOtpService) {
    this.userRepository     = userRepository;
    this.employerRepository = employerRepository;
    this.otpRepository      = otpRepository;
    this.whatsAppOtpService = whatsAppOtpService;
  }

  async execute({ fullName, phone, password, email }) {
    if (!fullName || !phone || !password) throw new AppError("Full name, phone, and password are required", 400);

    const exists = await this.userRepository.findByPhone(phone.trim());
    if (exists) throw new AppError("Phone already registered", 409);

    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.save({
      role: "employer",
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      passwordHash,
    });

    await this.employerRepository.save({ userId: user._id });

    // Delete any stale OTP for this phone before creating a fresh one
    await this.otpRepository.deleteByPhone(phone.trim());

    const otp     = generateOtp();
    const otpHash = await hashOtp(otp);
    await this.otpRepository.save({
      phone: phone.trim(),
      otpHash,
      expiresAt:        OTP.expiresAt(),
      resendAvailableAt: OTP.resendAvailableAt(),
    });

    await this.whatsAppOtpService.sendOtp(phone.trim(), otp);

    return { message: "Registration successful. OTP sent via WhatsApp.", userId: user._id };
  }
}

module.exports = RegisterEmployerUseCase;