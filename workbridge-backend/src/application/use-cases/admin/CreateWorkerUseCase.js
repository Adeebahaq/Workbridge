const AppError       = require("../../../shared/errors/AppError");
const { hashPassword } = require("../../../shared/utils/hash");

class CreateWorkerUseCase {
  constructor(userRepository, workerRepository, adminLogRepository) {
    this.userRepository     = userRepository;
    this.workerRepository   = workerRepository;
    this.adminLogRepository = adminLogRepository;
  }
  async execute({ adminId, fullName, phone, password, workerData }) {
    const exists = await this.userRepository.findByPhone(phone);
    if (exists) throw new AppError("Phone already registered", 409);
    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.save({ role: "worker", fullName, phone, passwordHash, isWhatsappVerified: true, createdByAdmin: true });
    await this.workerRepository.save({ ...workerData, userId: user._id, status: "Active", submittedAt: new Date() });
    await this.adminLogRepository.save({ adminId, action: "create_worker", targetUserId: user._id, timestamp: new Date() });
    return { userId: user._id, message: "Worker account created by admin" };
  }
}
module.exports = CreateWorkerUseCase;
