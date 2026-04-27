class GetMyJobsUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ userId, role }) {
    if (role === "worker") return this.jobRepository.findByWorker(userId);
    return this.jobRepository.findByEmployer(userId);
  }
}
module.exports = GetMyJobsUseCase;
