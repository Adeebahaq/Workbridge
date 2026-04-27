const AppError = require("../../../shared/errors/AppError");

class RejectWorkerUseCase {
  constructor(workerRepository, adminLogRepository) {
    this.workerRepository   = workerRepository;
    this.adminLogRepository = adminLogRepository;
  }
  async execute({ targetUserId, adminId, reason }) {
    if (!reason || reason.length < 20) throw new AppError("Rejection reason must be at least 20 characters");
    const profile = await this.workerRepository.update(targetUserId, {
      status: "Rejected",
      statusUpdatedAt: new Date(),
      adminRejectionReason: reason,
      adminReviewedBy: adminId,
      adminReviewedAt: new Date(),
    });
    if (!profile) throw new AppError("Worker not found", 404);
    await this.adminLogRepository.save({ adminId, action: "reject_worker", targetUserId, reason, timestamp: new Date() });
    return profile;
  }
}
module.exports = RejectWorkerUseCase;
