class SendJobRequestUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }
  async execute({ employerId, workerId, serviceId, hiringType, jobDate, description }) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return this.jobRepository.save({
      employerId, workerId, serviceId, hiringType, jobDate, description,
      status: "Requested", requestExpiresAt: expiresAt,
      statusHistory: [{ status: "Requested", changedAt: new Date(), changedBy: employerId }],
    });
  }
}
module.exports = SendJobRequestUseCase;
