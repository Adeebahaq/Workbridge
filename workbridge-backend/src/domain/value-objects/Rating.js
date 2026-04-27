const AppError = require("../../shared/errors/AppError");

class Rating {
  static SUBMISSION_DAYS = 7;

  constructor(stars) {
    if (stars < 1 || stars > 5) throw new AppError("Stars must be between 1 and 5");
    this.stars = stars;
  }
  static isWithinWindow(jobCompletedAt) {
    const cutoff = new Date(jobCompletedAt);
    cutoff.setDate(cutoff.getDate() + Rating.SUBMISSION_DAYS);
    return new Date() <= cutoff;
  }
}
module.exports = Rating;
