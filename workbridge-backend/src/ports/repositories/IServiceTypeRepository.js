class IServiceTypeRepository {
  async findAll()             { throw new Error("Not implemented"); }
  async findActive()          { throw new Error("Not implemented"); }
  async findById(id)          { throw new Error("Not implemented"); }
  async save(data)            { throw new Error("Not implemented"); }
  async disable(id)           { throw new Error("Not implemented"); }
}
module.exports = IServiceTypeRepository;
