const IJobRepository   = require("../../../../../ports/repositories/IJobRepository");
const Job              = require("../models/Job.model");
const WorkerProfile    = require("../models/WorkerProfile.model");
const Rating           = require("../models/Rating.model");

class MongoJobRepository extends IJobRepository {

  async findById(jobId) {
    return Job.findById(jobId).lean();
  }

  async findByWorker(workerId, status) {
    const q = { workerId };
    if (status) q.status = status;

    const jobs = await Job.find(q)
      .populate("serviceId",  "name")
      .populate("employerId", "fullName phone")
      .sort({ createdAt: -1 })
      .lean();

    // Attach servicePricing from WorkerProfile so the frontend
    // can display rate × quantity breakdown (hourly/daily)
    const profile = await WorkerProfile.findOne({ userId: workerId })
      .select("servicePricing")
      .lean();

    const pricing = profile?.servicePricing || [];

    return jobs.map(job => ({
      ...job,
      servicePricing: pricing,
    }));
  }

  async findByEmployer(employerId, status) {
    const q = { employerId };
    if (status) q.status = status;
    const jobs = await Job.find(q)
      .populate("serviceId", "name")
      .populate("workerId",  "fullName phone")
      .sort({ createdAt: -1 })
      .lean();

    // Attach hasRated flag so the frontend knows which completed jobs
    // the employer has already rated (persists across page refreshes)
    const completedJobIds = jobs
      .filter(j => j.status === "Completed")
      .map(j => j._id);

    const ratedJobIds = completedJobIds.length > 0
      ? (await Rating.find({ jobId: { $in: completedJobIds }, employerId }).select("jobId").lean())
          .map(r => r.jobId.toString())
      : [];

    return jobs.map(job => ({
      ...job,
      hasRated: ratedJobIds.includes(job._id.toString()),
    }));
  }

  async save(data) {
    return new Job(data).save();
  }

  async update(jobId, updates) {
    return Job.findByIdAndUpdate(jobId, { $set: updates }, { new: true }).lean();
  }

  async findExpiredRequests() {
    return Job.find({ status: "Requested", requestExpiresAt: { $lte: new Date() } }).lean();
  }

  async findAwaitingAutoConfirm() {
    return Job.find({
      status: "Awaiting Confirmation",
      confirmationExpiresAt: { $lte: new Date() },
    }).lean();
  }

  async updateJobStatus(jobId, status, changedBy, extraFields = {}) {
    const update = {
      status,
      ...extraFields,
      $push: { statusHistory: { status, changedAt: new Date(), changedBy } },
    };
    return Job.findByIdAndUpdate(jobId, update, { new: true }).lean();
  }
}

module.exports = MongoJobRepository;