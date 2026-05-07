const AppError = require("../../../shared/errors/AppError");

class MarkJobDoneUseCase {
  constructor(jobRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.notificationRepository = notificationRepository;
  }
  async execute({ jobId, workerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.workerId.toString() !== workerId.toString()) throw new AppError("Unauthorized", 403);
    if (job.status !== "In Progress") throw new AppError("Job must be In Progress to mark done", 400);
    const confirmBy = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const updated = await this.jobRepository.updateJobStatus(jobId, "Awaiting Confirmation", workerId, {
      markedDoneAt: new Date(),
      confirmationExpiresAt: confirmBy,
    });
    await this.notificationRepository.save({
      userId:       job.employerId,
      type:         "job_marked_done",
      title:        "Job Marked as Done",
      body:         `The worker has marked the job as done. Please confirm within 24 hours.`,
      relatedJobId: job._id,
    });
    return updated;
  }
}
module.exports = MarkJobDoneUseCase;