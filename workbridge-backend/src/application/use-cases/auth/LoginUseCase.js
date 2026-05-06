const { comparePassword } = require("../../../shared/utils/hash");
const { signToken }       = require("../../../shared/utils/jwt");
const AppError            = require("../../../shared/errors/AppError");

class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ phone, password }) {
    if (!phone || !password) throw new AppError("Phone and password are required", 400);

    const user = await this.userRepository.findByPhone(phone.trim());
    if (!user) throw new AppError("Invalid phone or password", 401);

    const match = await comparePassword(password, user.passwordHash);
    if (!match) throw new AppError("Invalid phone or password", 401);

    
if (!user.isWhatsappVerified && !user.isPhoneVerified && user.role !== "admin") {
      throw new AppError("Phone not verified. Please verify via OTP first.", 403);
    }

    await this.userRepository.updateByPhone(phone, { lastLoginAt: new Date() });

    const token = signToken({ userId: user._id, role: user.role, fullName: user.fullName, phone: user.phone });
    return { token, role: user.role, userId: user._id, fullName: user.fullName };
  }
}

module.exports = LoginUseCase;