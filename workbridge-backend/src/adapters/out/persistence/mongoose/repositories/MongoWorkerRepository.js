const IWorkerRepository = require("../../../../../ports/repositories/IWorkerRepository");
const WorkerProfile     = require("../models/WorkerProfile.model");
const User              = require("../models/User.model");
const mongoose          = require("mongoose");

class MongoWorkerRepository extends IWorkerRepository {
  async findById(userId) {
    return WorkerProfile.findOne({ userId })
      .populate("userId")
      .populate("services", "name")
      .lean();
  }
  async findByPhone(phone) {
    const user = await User.findOne({ phone, role: "worker" }).lean();
    if (!user) return null;
    return WorkerProfile.findOne({ userId: user._id }).populate("userId").lean();
  }
  async findByCnic(cnicNumber) {
    return WorkerProfile.findOne({ cnicNumber }).lean();
  }
  async save(workerData) {
    const profile = new WorkerProfile(workerData);
    return profile.save();
  }
  async update(id, updates) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const byProfileId = await WorkerProfile.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).lean();
      if (byProfileId) return byProfileId;
    }
    return WorkerProfile.findOneAndUpdate(
      { userId: id },
      { $set: updates },
      { new: true }
    ).lean();
  }
  async search(filters) {
    const query = { status: "Active" };
    if (filters.serviceId)             query.services              = filters.serviceId;
    if (filters.preferredCity)         query.preferredCity         = filters.preferredCity;
    if (filters.preferredArea)         query.preferredAreas        = filters.preferredArea;
    if (filters.preferredWorkingHours) query.preferredWorkingHours = filters.preferredWorkingHours;
    if (filters.daysAvailable)         query.daysAvailable         = filters.daysAvailable;
    if (filters.employmentType)        query.employmentType        = filters.employmentType;
    if (filters.availabilityBadge)     query.availabilityBadge     = filters.availabilityBadge;
    return WorkerProfile.find(query)
      .populate("userId", "fullName phone")
      .populate("services", "name")
      .sort({ averageRating: -1 })
      .lean();
  }
  async listAll(filters = {}) {
    const query = {};
    if (filters.status)        query.status        = filters.status;
    if (filters.serviceId)     query.services      = filters.serviceId;
    if (filters.preferredCity) query.preferredCity = filters.preferredCity;
    return WorkerProfile.find(query)
      .populate("userId", "fullName phone createdAt")
      .sort({ submittedAt: -1 })
      .lean();
  }
  async findPendingVerification() {
    return WorkerProfile.find({ status: "Pending Verification" }).sort({ submittedAt: 1 }).lean();
  }
  async findExpiredCnics() {
    return WorkerProfile.find({ cnicExpiryDate: { $lte: new Date() }, status: "Active" }).lean();
  }
}

module.exports = MongoWorkerRepository;