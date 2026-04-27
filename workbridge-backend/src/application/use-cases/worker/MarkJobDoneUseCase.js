const AppError = require("../../../shared/errors/AppError");

class MarkJobDoneUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ jobId, workerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.workerId.toString() !== workerId) throw new AppError("Unauthorized", 403);
    if (job.status !== "In Progress") throw new AppError("Job must be In Progress to mark done");
    const confirmBy = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return this.jobRepository.updateJobStatus(jobId, "Awaiting Confirmation", workerId, {
      markedDoneAt: new Date(),
      confirmationExpiresAt: confirmBy,
    });
  }
}
module.exports = MarkJobDoneUseCase;
