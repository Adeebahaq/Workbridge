const AppError = require("../../../shared/errors/AppError");
const RatingVO = require("../../../domain/value-objects/Rating");

class RateWorkerUseCase {
  constructor(jobRepository, ratingRepository, workerRepository) {
    this.jobRepository    = jobRepository;
    this.ratingRepository = ratingRepository;
    this.workerRepository = workerRepository;
  }
  async execute({ jobId, employerId, workerId, stars, feedback }) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.status !== "Completed") throw new AppError("Job must be completed to rate");
    if (!RatingVO.isWithinWindow(job.updatedAt)) throw new AppError("Rating window of 7 days has passed");
    const exists = await this.ratingRepository.existsForJob(jobId, employerId);
    if (exists) throw new AppError("Already rated this job", 409);
    new RatingVO(stars); // domain validation: 1-5
    const rating = await this.ratingRepository.save({ jobId, employerId, workerId, stars, feedback });
    const ratings = await this.ratingRepository.findByWorker(workerId);
    const avg = ratings.reduce((s, r) => s + r.stars, 0) / ratings.length;
    await this.workerRepository.update(workerId, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: ratings.length,
    });
    return rating;
  }
}
module.exports = RateWorkerUseCase;
