const INotificationRepository = require("../../../../../ports/repositories/INotificationRepository");
const Notification            = require("../models/Notification.model");

class MongoNotificationRepository extends INotificationRepository {
  async save(data) {
    return new Notification(data).save();
  }

  async findByUser(userId) {
    return Notification.find({ userId }).sort({ sentAt: -1 }).lean();
  }

  async markRead(notificationId, userId) {
    const query = userId
      ? { _id: notificationId, userId }   // scoped to owner
      : { _id: notificationId };
    return Notification.findOneAndUpdate(
      query,
      { isRead: true, readAt: new Date() },
      { new: true }
    ).lean();
  }

  async markAllRead(userId) {
    return Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }

  async countUnread(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

module.exports = MongoNotificationRepository;