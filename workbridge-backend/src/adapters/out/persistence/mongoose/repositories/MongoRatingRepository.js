const IRatingRepository = require("../../../../../ports/repositories/IRatingRepository");
const Rating            = require("../models/Rating.model");

class MongoRatingRepository extends IRatingRepository {
  async save(data)                      { return new Rating(data).save(); }
  async findByWorker(workerId)          { return Rating.find({ workerId }).sort({ submittedAt: -1 }).lean(); }
  async findByJob(jobId)                { return Rating.find({ jobId }).lean(); }
  async existsForJob(jobId, employerId) { return !!(await Rating.findOne({ jobId, employerId }).lean()); }
}

module.exports = MongoRatingRepository;
