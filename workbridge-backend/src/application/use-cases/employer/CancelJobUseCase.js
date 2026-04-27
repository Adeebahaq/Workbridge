const AppError = require("../../../shared/errors/AppError");

class CancelJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ jobId, employerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.employerId.toString() !== employerId) throw new AppError("Unauthorized", 403);
    if (!["Requested", "Accepted"].includes(job.status)) throw new AppError("Cannot cancel at this stage");
    return this.jobRepository.updateJobStatus(jobId, "Cancelled", employerId, { cancelledByEmployerAt: new Date() });
  }
}
module.exports = CancelJobUseCase;
