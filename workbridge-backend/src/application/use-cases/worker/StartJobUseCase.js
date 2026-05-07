const AppError = require("../../../shared/errors/AppError");

class StartJobUseCase {
  constructor(jobRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.notificationRepository = notificationRepository;
  }
  async execute({ jobId, workerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.workerId.toString() !== workerId.toString()) throw new AppError("Unauthorized", 403);
    if (job.status !== "Accepted") throw new AppError("Job must be Accepted to start", 400);
    if (job.jobDate) {
      const today  = new Date(); today.setHours(0, 0, 0, 0);
      const jobDay = new Date(job.jobDate); jobDay.setHours(0, 0, 0, 0);
      if (today < jobDay) throw new AppError("Cannot start the job before the scheduled date", 400);
    }
    const updated = await this.jobRepository.updateJobStatus(jobId, "In Progress", workerId, { startedAt: new Date() });
    await this.notificationRepository.save({
      userId:       job.employerId,
      type:         "job_accepted",
      title:        "Job Started",
      body:         `The worker has started the job for ${new Date(job.jobDate).toDateString()}.`,
      relatedJobId: job._id,
    });
    return updated;
  }
}
module.exports = StartJobUseCase;