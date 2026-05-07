class IMessageRepository {
  async save(data)                      { throw new Error("Not implemented"); }
  async findByParticipants(userA, userB){ throw new Error("Not implemented"); }
  async markRead(messageId)             { throw new Error("Not implemented"); }
}
module.exports = IMessageRepository;