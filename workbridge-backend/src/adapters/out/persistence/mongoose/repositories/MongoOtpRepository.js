const IOtpRepository    = require("../../../../../ports/repositories/IOtpRepository");
const OtpVerification   = require("../models/OtpVerification.model");

class MongoOtpRepository extends IOtpRepository {
  async save(data)            { return new OtpVerification(data).save(); }
  async findByPhone(phone)    { return OtpVerification.findOne({ phone, verified: false, expiresAt: { $gt: new Date() } }).lean(); }
  async deleteByPhone(phone)  { return OtpVerification.deleteMany({ phone }); }
  async incrementAttempts(id) { return OtpVerification.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { new: true }).lean(); }
}

module.exports = MongoOtpRepository;