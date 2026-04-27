// ports/repositories/IWorkerRepository.js
// Interface contract — MongoWorkerRepository implements this

class IWorkerRepository {
  async findById(userId)               { throw new Error("Not implemented"); }
  async findByPhone(phone)             { throw new Error("Not implemented"); }
  async findByCnic(cnicNumber)         { throw new Error("Not implemented"); }
  async save(workerData)               { throw new Error("Not implemented"); }
  async update(userId, updates)        { throw new Error("Not implemented"); }
  async search(filters)                { throw new Error("Not implemented"); }
  async findPendingVerification()      { throw new Error("Not implemented"); }
  async findExpiredCnics()             { throw new Error("Not implemented"); }
}

module.exports = IWorkerRepository;
