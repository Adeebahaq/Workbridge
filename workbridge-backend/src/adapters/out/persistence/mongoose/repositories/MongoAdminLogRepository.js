const IAdminLogRepository = require("../../../../../ports/repositories/IAdminLogRepository");
const AdminLog            = require("../models/AdminLog.model");

class MongoAdminLogRepository extends IAdminLogRepository {
  async save(data)               { return new AdminLog(data).save(); }
  async findByAdmin(adminId)     { return AdminLog.find({ adminId }).sort({ timestamp: -1 }).lean(); }
  async findByTarget(targetUserId){ return AdminLog.find({ targetUserId }).sort({ timestamp: -1 }).lean(); }
}

module.exports = MongoAdminLogRepository;
