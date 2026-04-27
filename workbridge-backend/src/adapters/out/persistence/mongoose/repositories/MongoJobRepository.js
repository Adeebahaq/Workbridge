const IJobRepository = require("../../../../../ports/repositories/IJobRepository");
const Job            = require("../models/Job.model");

class MongoJobRepository extends IJobRepository {
  async findById(jobId)                    { return Job.findById(jobId).lean(); }
  async findByWorker(workerId, status)     {
    const q = { workerId };
    if (status) q.status = status;
    return Job.find(q).sort({ createdAt: -1 }).lean();
  }
async findByWorker(workerId, status) {
  const q = { workerId };
  if (status) q.status = status;
  return Job.find(q)
    .populate("serviceId",  "name")
    .populate("employerId", "fullName phone")
    .sort({ createdAt: -1 })
    .lean();
}

async findByEmployer(employerId, status) {
  const q = { employerId };
  if (status) q.status = status;
  return Job.find(q)
    .populate("serviceId", "name")
    .populate("workerId",  "fullName phone")   // ← this is what was missing
    .sort({ createdAt: -1 })
    .lean();
}
  async save(data)            { return new Job(data).save(); }
  async update(jobId, updates){ return Job.findByIdAndUpdate(jobId, { $set: updates }, { new: true }).lean(); }
  async findExpiredRequests() {
    return Job.find({ status: "Requested", requestExpiresAt: { $lte: new Date() } }).lean();
  }
  async findAwaitingAutoConfirm() {
    return Job.find({ status: "Awaiting Confirmation", confirmationExpiresAt: { $lte: new Date() } }).lean();
  }
  // Status transition helper — keeps statusHistory consistent
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
