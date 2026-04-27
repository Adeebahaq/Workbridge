const AppError = require("../../../shared/errors/AppError");

class UpdateAvailabilityUseCase {
  constructor(workerRepository) {
    this.workerRepository = workerRepository;
  }

  async execute({ userId, availabilityBadge, preferredCity, maxTravelDistance, daysAvailable }) {
    const updates = {};

    if (availabilityBadge !== undefined) {
      if (!["Available", "Busy"].includes(availabilityBadge))
        throw new AppError("Invalid availability value");
      updates.availabilityBadge = availabilityBadge;
      updates.badgeUpdatedAt    = new Date();
    }

    if (preferredCity !== undefined)     updates.preferredCity     = preferredCity;
    if (maxTravelDistance !== undefined) updates.maxTravelDistance = Number(maxTravelDistance);
    if (daysAvailable !== undefined) {
      if (!Array.isArray(daysAvailable) || daysAvailable.length === 0)
        throw new AppError("At least one day required");
      updates.daysAvailable = daysAvailable;
    }

    if (Object.keys(updates).length === 0)
      throw new AppError("No fields to update");

    return this.workerRepository.update(userId, updates);
  }
}

module.exports = UpdateAvailabilityUseCase;