const AppError = require("../../../shared/errors/AppError");

class GetWorkerPublicProfileUseCase {
  constructor(workerRepository, ratingRepository) {
    this.workerRepository = workerRepository;
    this.ratingRepository = ratingRepository;
  }

  async execute({ workerId }) {
    const profile = await this.workerRepository.findByUserId(workerId);
    if (!profile) throw new AppError("Worker not found", 404);
    if (profile.status !== "Active") throw new AppError("Worker is not available", 404);

    // Fetch reviews for display
    const ratings = await this.ratingRepository.findByWorker(workerId);

    return {
      workerId,
      fullName:          profile.userId?.fullName,
      services:          profile.services,
      servicePricing:    profile.servicePricing,
      preferredCity:     profile.preferredCity,
      preferredDistrict: profile.preferredDistrict,
      daysAvailable:     profile.daysAvailable,
      availabilitySlots: profile.availabilitySlots,
      maxTravelDistance: profile.maxTravelDistance,
      averageRating:     profile.averageRating,
      totalReviews:      profile.totalReviews,
      totalCompletedJobs:profile.totalCompletedJobs,
      availabilityBadge: profile.availabilityBadge,
      ratings: ratings.map(r => ({
        stars:       r.stars,
        feedback:    r.feedback,
        submittedAt: r.submittedAt,
      })),
    };
  }
}

module.exports = GetWorkerPublicProfileUseCase;