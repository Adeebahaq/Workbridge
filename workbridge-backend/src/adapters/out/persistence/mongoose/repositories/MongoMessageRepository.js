const IMessageRepository = require("../../../../../ports/repositories/IMessageRepository");
const Message            = require("../models/Message.model");

function makeKey(a, b) { return [a, b].map(String).sort().join("_"); }

class MongoMessageRepository extends IMessageRepository {
  async save({ senderId, receiverId, text }) {
    return new Message({
      participantKey: makeKey(senderId, receiverId),
      senderId, receiverId, text
    }).save();
  }

  async findByParticipants(userA, userB) {
    return Message.find({ participantKey: makeKey(userA, userB) })
      .sort({ sentAt: 1 }).lean();
  }

  async markRead(messageId) {
    return Message.findByIdAndUpdate(
      messageId, { isRead: true, readAt: new Date() }, { new: true }
    ).lean();
  }

  async save({ senderId, receiverId, text, audioUrl, duration, messageType }) {
  return new Message({
    participantKey: makeKey(senderId, receiverId),
    senderId, receiverId, text, audioUrl, duration,
    messageType: messageType || (audioUrl ? "voice" : "text")
  }).save();
}
}

module.exports = MongoMessageRepository;