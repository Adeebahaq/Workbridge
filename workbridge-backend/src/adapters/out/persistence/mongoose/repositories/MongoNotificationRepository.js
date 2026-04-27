const INotificationRepository = require("../../../../../ports/repositories/INotificationRepository");
const Notification            = require("../models/Notification.model");

class MongoNotificationRepository extends INotificationRepository {
  async save(data)               { return new Notification(data).save(); }
  async findByUser(userId)       { return Notification.find({ userId }).sort({ sentAt: -1 }).lean(); }
  async markRead(notificationId) {
    return Notification.findByIdAndUpdate(notificationId, { isRead: true, readAt: new Date() }, { new: true }).lean();
  }
}

module.exports = MongoNotificationRepository;
