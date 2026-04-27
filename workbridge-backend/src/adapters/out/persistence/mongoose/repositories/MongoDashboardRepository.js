const IDashboardRepository = require("../../../../../ports/repositories/IDashboardRepository");
const DashboardSnapshot    = require("../models/DashboardSnapshot.model");

class MongoDashboardRepository extends IDashboardRepository {
  async getLatestSnapshot() { return DashboardSnapshot.findOne().sort({ generatedAt: -1 }).lean(); }
  async saveSnapshot(data)  { return new DashboardSnapshot(data).save(); }
}

module.exports = MongoDashboardRepository;
