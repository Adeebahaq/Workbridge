const AppError = require("../../../shared/errors/AppError");

class GetWorkerRatingsUseCase {
  constructor(ratingRepository, workerRepository) {
    this.ratingRepository = ratingRepository;
    this.workerRepository = workerRepository;
  }

  async execute({ userId }) {
    const profile = await this.workerRepository.findByUserId(userId);
    if (!profile) throw new AppError("Worker profile not found", 404);

    const ratings = await this.ratingRepository.findByWorker(userId);

    return {
      averageRating: profile.averageRating || 0,
      totalReviews:  profile.totalReviews  || 0,
      ratings: ratings.map(r => ({
        stars:       r.stars,
        feedback:    r.feedback || null,
        submittedAt: r.submittedAt,
        jobId:       r.jobId,
      })),
    };
  }
}

module.exports = GetWorkerRatingsUseCase;