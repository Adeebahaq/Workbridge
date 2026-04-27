const IUserRepository = require("../../../../../ports/repositories/IUserRepository");
const User            = require("../models/User.model");

class MongoUserRepository extends IUserRepository {
  async findByPhone(phone)            { return User.findOne({ phone }).lean(); }
  async findById(userId)              { return User.findById(userId).lean(); }
  async save(data)                    { return User.create(data); }
  async updateByPhone(phone, updates) { return User.findOneAndUpdate({ phone }, { $set: updates }, { new: true }).lean(); }
  async updateById(userId, updates)   { return User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).lean(); }
}

module.exports = MongoUserRepository;
