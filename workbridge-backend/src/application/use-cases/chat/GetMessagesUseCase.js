class GetMessagesUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }
  async execute({ jobId }) {
    return this.messageRepository.findByJob(jobId);
  }
}
module.exports = GetMessagesUseCase;
