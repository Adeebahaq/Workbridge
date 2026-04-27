const AppError = require("../../../shared/errors/AppError");
const { WORKER_REJECTION_REASONS } = require("../../../shared/constants");

class RejectJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ jobId, workerId, reason }) {
    if (!WORKER_REJECTION_REASONS.includes(reason)) throw new AppError("Invalid rejection reason");
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.workerId.toString() !== workerId) throw new AppError("Unauthorized", 403);
    if (job.status !== "Requested") throw new AppError("Job is not in Requested state");
    return this.jobRepository.updateJobStatus(jobId, "Rejected", workerId, { workerRejectionReason: reason });
  }
}
module.exports = RejectJobUseCase;
