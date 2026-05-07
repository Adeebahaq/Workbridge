const INotificationRepository = require("../../../../../ports/repositories/INotificationRepository");
const Notification             = require("../models/Notification.model");

class MongoNotificationRepository extends INotificationRepository {

  async save(data) {
    const notification = await new Notification(data).save();
    // ✅ Push to the recipient's browser in real time
    if (global.io) {
      global.io
        .to(`user_${notification.userId.toString()}`)
        .emit("new_notification", notification.toObject());
    }
    return notification;
  }

  async findByUser(userId) {
    return Notification.find({ userId }).sort({ sentAt: -1 }).lean();
  }

  async markRead(notificationId, userId) {
    const query = userId
      ? { _id: notificationId, userId }
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