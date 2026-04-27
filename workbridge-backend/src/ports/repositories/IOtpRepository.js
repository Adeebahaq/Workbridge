class IOtpRepository {
  async save(data)           { throw new Error("Not implemented"); }
  async findByPhone(phone)   { throw new Error("Not implemented"); }
  async deleteByPhone(phone) { throw new Error("Not implemented"); }
  async incrementAttempts(id){ throw new Error("Not implemented"); }
}
module.exports = IOtpRepository;
