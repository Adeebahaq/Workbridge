class IAdminLogRepository {
  async save(data)                  { throw new Error("Not implemented"); }
  async findByAdmin(adminId)        { throw new Error("Not implemented"); }
  async findByTarget(targetUserId)  { throw new Error("Not implemented"); }
}
module.exports = IAdminLogRepository;
