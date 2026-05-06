const AppError = require("../../../shared/errors/AppError");

class RateWorkerUseCase {
  constructor(jobRepository, ratingRepository, workerRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.ratingRepository       = ratingRepository;
    this.workerRepository       = workerRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ jobId, employerId, workerId, stars, feedback }) {
    if (!jobId || !workerId || !stars)
      throw new AppError("jobId, workerId, and stars are required", 400);

    const starsNum = Number(stars);
    if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5)
      throw new AppError("Stars must be an integer between 1 and 5", 400);

    if (feedback && feedback.length > 300)
      throw new AppError("Feedback must be 300 characters or less", 400);

    const job = await this.jobRepository.findById(jobId);
    if (!job)                                     throw new AppError("Job not found", 404);
    if (job.employerId.toString() !== employerId) throw new AppError("Unauthorized", 403);
    if (job.status !== "Completed")               throw new AppError("Job must be completed to rate", 400);

    // FR25: 7-day window from completion
    const completedAt   = job.employerConfirmedAt || job.autoCompletedAt || job.updatedAt;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(completedAt).getTime() > sevenDaysInMs)
      throw new AppError("Rating window of 7 days has passed", 400);

    // FR25: only one rating per employer per job
    const exists = await this.ratingRepository.existsForJob(jobId, employerId);
    if (exists) throw new AppError("You have already rated this job", 409);

    const rating = await this.ratingRepository.save({
      jobId, employerId, workerId, stars: starsNum, feedback,
    });

    // Recalculate worker average rating
    const allRatings = await this.ratingRepository.findByWorker(workerId);
    const avg = allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length;
    await this.workerRepository.update(workerId, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews:  allRatings.length,
    });

    // Notify worker that they received a rating
    await this.notificationRepository.save({
      userId:          workerId,
      type:            "job_confirmed",
      title:           "New Rating Received",
      body:            `You received a ${starsNum}-star rating.` + (feedback ? ' "' + feedback + '"' : ""),
      relatedJobId:    job._id,
      relatedWorkerId: workerId,
    });

    return rating;
  }
}

module.exports = RateWorkerUseCase;