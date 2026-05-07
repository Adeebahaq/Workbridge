const AppError = require("../../../shared/errors/AppError");

class SendMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ senderId, receiverId, text, audioUrl, duration, messageType }) {
  if (!text && !audioUrl) throw new Error("Message must have text or audio");
  if (text && text.length > 500) throw new AppError("Text too long");
  return this.messageRepository.save({ senderId, receiverId, text, audioUrl, duration, messageType });
}
}
module.exports = SendMessageUseCase;
