const IMessageRepository = require("../../../../../ports/repositories/IMessageRepository");
const Message            = require("../models/Message.model");

class MongoMessageRepository extends IMessageRepository {
  async save(data)          { return new Message(data).save(); }
  async findByJob(jobId)    { return Message.find({ jobId }).sort({ sentAt: 1 }).lean(); }
  async markRead(messageId) {
    return Message.findByIdAndUpdate(messageId, { isRead: true, readAt: new Date() }, { new: true }).lean();
  }
}

module.exports = MongoMessageRepository;
