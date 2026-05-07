class GetWorkerNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ userId }) {
    const notifications = await this.notificationRepository.findByUser(userId);
    const unreadCount   = notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
  }
}

module.exports = GetWorkerNotificationsUseCase;