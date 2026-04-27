const IEmployerRepository = require("../../../../../ports/repositories/IEmployerRepository");
const EmployerProfile     = require("../models/EmployerProfile.model");
const User                = require("../models/User.model");

class MongoEmployerRepository extends IEmployerRepository {
  async findById(userId) {
    return EmployerProfile.findOne({ userId }).populate("userId").lean();
  }
  async findByPhone(phone) {
    const user = await User.findOne({ phone, role: "employer" }).lean();
    if (!user) return null;
    return EmployerProfile.findOne({ userId: user._id }).populate("userId").lean();
  }
  async save(data) {
    return new EmployerProfile(data).save();
  }
  async update(userId, updates) {
    return EmployerProfile.findOneAndUpdate({ userId }, { $set: updates }, { new: true }).lean();
  }
}

module.exports = MongoEmployerRepository;
