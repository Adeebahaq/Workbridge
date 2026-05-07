class GetMessagesUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }
 async execute({ userA, userB }) {
  return this.messageRepository.findByParticipants(userA, userB);
}
}
module.exports = GetMessagesUseCase;
