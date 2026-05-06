const AppError = require("../../../shared/errors/AppError");

class CancelJobUseCase {
  constructor(jobRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ jobId, employerId }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job)                                                   throw new AppError("Job not found", 404);
    if (job.employerId.toString() !== employerId)               throw new AppError("Unauthorized", 403);
    if (job.status !== "Requested")
      throw new AppError("Job can only be cancelled while status is Requested", 400);

    const updated = await this.jobRepository.updateJobStatus(
      jobId, "Cancelled", employerId, { cancelledByEmployerAt: new Date() }
    );

    // FR20: notify worker of cancellation
    await this.notificationRepository.save({
      userId:       job.workerId,
      type:         "job_cancelled",
      title:        "Job Request Cancelled",
      body:         `The employer has cancelled the job request for ${new Date(job.jobDate).toDateString()}.`,
      relatedJobId: job._id,
    });

    return updated;
  }
}

module.exports = CancelJobUseCase;