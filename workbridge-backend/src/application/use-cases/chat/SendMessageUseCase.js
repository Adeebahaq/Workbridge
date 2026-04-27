const AppError = require("../../../shared/errors/AppError");

class SendMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }
  async execute({ jobId, senderId, receiverId, text }) {
    if (!text || text.length > 500) throw new AppError("Message must be 1-500 characters");
    return this.messageRepository.save({ jobId, senderId, receiverId, text });
  }
}
module.exports = SendMessageUseCase;
