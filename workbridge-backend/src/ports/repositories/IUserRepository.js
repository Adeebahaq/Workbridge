// ports/repositories/IUserRepository.js
class IUserRepository {
  async findByPhone(phone)           { throw new Error("Not implemented"); }
  async findById(userId)             { throw new Error("Not implemented"); }
  async save(data)                   { throw new Error("Not implemented"); }
  async updateByPhone(phone, updates){ throw new Error("Not implemented"); }
  async updateById(userId, updates)  { throw new Error("Not implemented"); }
}
module.exports = IUserRepository;
