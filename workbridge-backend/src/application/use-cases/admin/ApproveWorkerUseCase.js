const AppError = require("../../../shared/errors/AppError");

class ApproveWorkerUseCase {
  constructor(workerRepository, adminLogRepository) {
    this.workerRepository   = workerRepository;
    this.adminLogRepository = adminLogRepository;
  }
  async execute({ targetUserId, adminId }) {
    const profile = await this.workerRepository.update(targetUserId, {
      status: "Active",
      statusUpdatedAt: new Date(),
      adminReviewedBy: adminId,
      adminReviewedAt: new Date(),
    });
    if (!profile) throw new AppError("Worker not found", 404);
    await this.adminLogRepository.save({ adminId, action: "approve_worker", targetUserId, timestamp: new Date() });
    return profile;
  }
}
module.exports = ApproveWorkerUseCase;
