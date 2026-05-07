const AppError = require("../../../shared/errors/AppError");

class AcceptJobUseCase {
  constructor(jobRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.notificationRepository = notificationRepository;
  }
  async execute({ jobId, workerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.workerId.toString() !== workerId.toString()) throw new AppError("Unauthorized", 403);
    if (job.status !== "Requested") throw new AppError("Job is not in Requested state", 400);
    const updated = await this.jobRepository.updateJobStatus(jobId, "Accepted", workerId);
    await this.notificationRepository.save({
      userId:       job.employerId,
      type:         "job_accepted",
      title:        "Job Request Accepted",
      body:         `The worker has accepted your job request for ${new Date(job.jobDate).toDateString()}.`,
      relatedJobId: job._id,
    });
    return updated;
  }
}
module.exports = AcceptJobUseCase;