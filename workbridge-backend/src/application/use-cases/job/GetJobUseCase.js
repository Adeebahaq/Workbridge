const AppError = require("../../../shared/errors/AppError");

class GetJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ jobId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    return job;
  }
}
module.exports = GetJobUseCase;
