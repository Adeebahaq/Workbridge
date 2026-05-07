const AppError = require("../../../shared/errors/AppError");
const { signToken } = require("../../../shared/utils/jwt");

class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async execute({ phone, password }) {
    const user = await this.userRepository.findByPhone(phone);
    if (!user) throw new AppError("Invalid credentials", 401);

    const { comparePassword } = require("../../../shared/utils/hash");
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError("Invalid credentials", 401);

    
if (!user.isWhatsappVerified && !user.isPhoneVerified && user.role !== "admin") {
      throw new AppError("Phone not verified. Please verify via OTP first.", 403);
    }

    // ✅ FIX: Always stringify _id so JWT payload has a clean string
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
    });
    return { token, role: user.role, userId: user._id.toString(), fullName: user.fullName };
  }
}
module.exports = LoginUseCase;