const AppError = require("../../../shared/errors/AppError");

class AcceptJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ jobId, workerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.workerId.toString() !== workerId) throw new AppError("Unauthorized", 403);
    if (job.status !== "Requested") throw new AppError("Job is not in Requested state");
    return this.jobRepository.updateJobStatus(jobId, "Accepted", workerId);
  }
}
module.exports = AcceptJobUseCase;
