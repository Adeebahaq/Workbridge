class IEmployerRepository {
  async findById(userId)        { throw new Error("Not implemented"); }
  async findByPhone(phone)      { throw new Error("Not implemented"); }
  async save(employerData)      { throw new Error("Not implemented"); }
  async update(userId, updates) { throw new Error("Not implemented"); }
}
module.exports = IEmployerRepository;
