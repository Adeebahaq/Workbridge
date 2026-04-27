class INotificationRepository {
  async save(data)                    { throw new Error("Not implemented"); }
  async findByUser(userId)            { throw new Error("Not implemented"); }
  async markRead(notificationId)      { throw new Error("Not implemented"); }
}
module.exports = INotificationRepository;
