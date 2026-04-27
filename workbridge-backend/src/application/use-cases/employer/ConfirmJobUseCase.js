const AppError = require("../../../shared/errors/AppError");

class ConfirmJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ jobId, employerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.employerId.toString() !== employerId) throw new AppError("Unauthorized", 403);
    if (job.status !== "Awaiting Confirmation") throw new AppError("Job is not awaiting confirmation");
    return this.jobRepository.updateJobStatus(jobId, "Completed", employerId, { employerConfirmedAt: new Date() });
  }
}
module.exports = ConfirmJobUseCase;
