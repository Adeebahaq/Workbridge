class INotificationRepository {
  async save(data)                            { throw new Error("Not implemented"); }
  async findByUser(userId)                   { throw new Error("Not implemented"); }
  async markRead(notificationId, userId)     { throw new Error("Not implemented"); }
  async markAllRead(userId)                  { throw new Error("Not implemented"); }
  async countUnread(userId)                  { throw new Error("Not implemented"); }
}
module.exports = INotificationRepository;