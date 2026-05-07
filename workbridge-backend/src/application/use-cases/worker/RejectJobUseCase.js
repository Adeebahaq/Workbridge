const AppError = require("../../../shared/errors/AppError");
const { WORKER_REJECTION_REASONS } = require("../../../shared/constants");

class RejectJobUseCase {
  constructor(jobRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.notificationRepository = notificationRepository;
  }
  async execute({ jobId, workerId, reason }) {
    if (!WORKER_REJECTION_REASONS.includes(reason)) throw new AppError("Invalid rejection reason", 400);
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.workerId.toString() !== workerId.toString()) throw new AppError("Unauthorized", 403);
    if (job.status !== "Requested") throw new AppError("Job is not in Requested state", 400);
    const updated = await this.jobRepository.updateJobStatus(jobId, "Rejected", workerId, { workerRejectionReason: reason });
    await this.notificationRepository.save({
      userId:       job.employerId,
      type:         "job_rejected",
      title:        "Job Request Rejected",
      body:         `The worker has rejected your job request. Reason: ${reason}.`,
      relatedJobId: job._id,
    });
    return updated;
  }
}
module.exports = RejectJobUseCase;