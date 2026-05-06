const AppError = require("../../../shared/errors/AppError");

class ConfirmJobUseCase {
  constructor(jobRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ jobId, employerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job)                                     throw new AppError("Job not found", 404);
    if (job.employerId.toString() !== employerId) throw new AppError("Unauthorized", 403);
    if (job.status !== "Awaiting Confirmation")   throw new AppError("Job is not awaiting confirmation", 400);

    const updated = await this.jobRepository.updateJobStatus(
      jobId, "Completed", employerId, { employerConfirmedAt: new Date() }
    );

    // Notify worker that employer confirmed job as done
    await this.notificationRepository.save({
      userId:       job.workerId,
      type:         "job_confirmed",
      title:        "Job Confirmed",
      body:         `The employer has confirmed the job as completed.`,
      relatedJobId: job._id,
    });

    return updated;
  }
}

module.exports = ConfirmJobUseCase;