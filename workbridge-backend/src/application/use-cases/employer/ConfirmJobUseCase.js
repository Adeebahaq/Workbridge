const AppError = require("../../../shared/errors/AppError");

class ConfirmJobUseCase {
  constructor(jobRepository, notificationRepository, workerRepository) {
    this.jobRepository          = jobRepository;
    this.notificationRepository = notificationRepository;
    this.workerRepository       = workerRepository;
  }

  async execute({ jobId, employerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job)                                                throw new AppError("Job not found", 404);
    if (job.employerId.toString() !== employerId.toString()) throw new AppError("Unauthorized", 403);
    if (job.status !== "Awaiting Confirmation")              throw new AppError("Job is not awaiting confirmation", 400);

    const updated = await this.jobRepository.updateJobStatus(
      jobId, "Completed", employerId, { employerConfirmedAt: new Date() }
    );

    // ✅ Increment totalCompletedJobs on the worker's profile
    const workerProfile = await this.workerRepository.findByUserId(job.workerId.toString());
    if (workerProfile) {
      const newCount = (workerProfile.totalCompletedJobs || 0) + 1;
      await this.workerRepository.update(job.workerId.toString(), {
        totalCompletedJobs: newCount,
      });
    }

    await this.notificationRepository.save({
      userId:       job.workerId,
      type:         "job_confirmed",
      title:        "Job Confirmed",
      body:         "The employer has confirmed the job as completed.",
      relatedJobId: job._id,
    });

    return updated;
  }
}

module.exports = ConfirmJobUseCase;