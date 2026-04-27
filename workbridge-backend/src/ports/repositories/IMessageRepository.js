class IMessageRepository {
  async save(data)              { throw new Error("Not implemented"); }
  async findByJob(jobId)        { throw new Error("Not implemented"); }
  async markRead(messageId)     { throw new Error("Not implemented"); }
}
module.exports = IMessageRepository;
