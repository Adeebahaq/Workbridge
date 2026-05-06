const AppError = require("../../../shared/errors/AppError");

class MarkNotificationReadUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ notificationId, userId }) {
    const result = await this.notificationRepository.markRead(notificationId, userId);
    if (!result) throw new AppError("Notification not found", 404);
    return result;
  }
}

module.exports = MarkNotificationReadUseCase;