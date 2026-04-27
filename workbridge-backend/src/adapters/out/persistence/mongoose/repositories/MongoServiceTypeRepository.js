const IServiceTypeRepository = require("../../../../../ports/repositories/IServiceTypeRepository");
const ServiceType            = require("../models/ServiceType.model");

class MongoServiceTypeRepository extends IServiceTypeRepository {
  async findAll()    { return ServiceType.find().lean(); }
  async findActive() { return ServiceType.find({ isActive: true }).lean(); }
  async findById(id) { return ServiceType.findById(id).lean(); }
  async save(data)   { return new ServiceType(data).save(); }
  async disable(id)  { return ServiceType.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean(); }
}

module.exports = MongoServiceTypeRepository;
