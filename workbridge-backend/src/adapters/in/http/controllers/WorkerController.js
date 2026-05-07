const WorkerProfile = require("../../../out/persistence/mongoose/models/WorkerProfile.model");

class WorkerController {
  constructor({
    registerWorkerUseCase,
    updateAvailabilityUseCase,
    acceptJobUseCase,
    rejectJobUseCase,
    startJobUseCase,
    markJobDoneUseCase,
    verifyWorkerUseCase,
    getWorkerRatingsUseCase,
    getWorkerNotificationsUseCase,
    markNotificationReadUseCase,
  }) {
    this.registerWorkerUseCase          = registerWorkerUseCase;
    this.updateAvailabilityUseCase      = updateAvailabilityUseCase;
    this.acceptJobUseCase               = acceptJobUseCase;
    this.rejectJobUseCase               = rejectJobUseCase;
    this.startJobUseCase                = startJobUseCase;
    this.markJobDoneUseCase             = markJobDoneUseCase;
    this.verifyWorkerUseCase            = verifyWorkerUseCase;
    this.getWorkerRatingsUseCase        = getWorkerRatingsUseCase;
    this.getWorkerNotificationsUseCase  = getWorkerNotificationsUseCase;
    this.markNotificationReadUseCase    = markNotificationReadUseCase;
  }

  async register(req, res, next) {
    try {
      const workerData = {
        ...req.body,
        cnicFrontImage: req.file
          ? {
              url:        req.file.path.replace(/\\/g, "/"),
              fileSize:   req.file.size,
              mimeType:   req.file.mimetype,
              uploadedAt: new Date(),
            }
          : null,
      };
      res.status(201).json(await this.registerWorkerUseCase.execute(workerData));
    } catch (e) {
      if (req.file && req.file.path) require("fs").unlink(req.file.path, () => {});
      next(e);
    }
  }

  async getMe(req, res, next) {
    try {
      const profile = await this.verifyWorkerUseCase.execute({ userId: req.user.userId });
      res.json(profile);
    } catch (e) { next(e); }
  }

  async updateAvailability(req, res, next) {
    try {
      res.json(await this.updateAvailabilityUseCase.execute({
        userId: req.user.userId,
        ...req.body,
      }));
    } catch (e) { next(e); }
  }

  async updatePricing(req, res, next) {
    try {
      const { servicePricing } = req.body;
      if (!servicePricing) {
        return res.status(400).json({ message: "servicePricing is required" });
      }

      const profile = await WorkerProfile.findOne({ userId: req.user.userId }).lean();
      if (!profile) return res.status(404).json({ message: "Worker profile not found" });

      const serviceId = profile.services?.[0] || null;

      const pricingEntry = {
        serviceId,
        hourlyRate:  servicePricing.hourlyRate  ? Number(servicePricing.hourlyRate)  : undefined,
        dailyRate:   servicePricing.dailyRate   ? Number(servicePricing.dailyRate)   : undefined,
        weeklyRate:  servicePricing.weeklyRate  ? Number(servicePricing.weeklyRate)  : undefined,
        monthlyRate: servicePricing.monthlyRate ? Number(servicePricing.monthlyRate) : undefined,
      };

      const updated = await WorkerProfile.findOneAndUpdate(
        { userId: req.user.userId },
        { $set: { servicePricing: [pricingEntry] } },
        { new: true }
      ).lean();

      res.json({ message: "Pricing updated successfully", servicePricing: updated.servicePricing });
    } catch (e) { next(e); }
  }

  async acceptJob(req, res, next) {
    try {
      res.json(await this.acceptJobUseCase.execute({
        jobId:    req.params.jobId,
        workerId: req.user.userId,
      }));
    } catch (e) { next(e); }
  }

  async rejectJob(req, res, next) {
    try {
      res.json(await this.rejectJobUseCase.execute({
        jobId:    req.params.jobId,
        workerId: req.user.userId,
        reason:   req.body.reason,
      }));
    } catch (e) { next(e); }
  }

  async startJob(req, res, next) {
    try {
      res.json(await this.startJobUseCase.execute({
        jobId:    req.params.jobId,
        workerId: req.user.userId,
      }));
    } catch (e) { next(e); }
  }

  async markJobDone(req, res, next) {
    try {
      res.json(await this.markJobDoneUseCase.execute({
        jobId:    req.params.jobId,
        workerId: req.user.userId,
      }));
    } catch (e) { next(e); }
  }

  // ── NEW: Worker sees their own ratings ───────────────────────────────────
  async getMyRatings(req, res, next) {
    try {
      res.json(await this.getWorkerRatingsUseCase.execute({ userId: req.user.userId }));
    } catch (e) { next(e); }
  }

  // ── NEW: Worker sees their notifications (including rating_received) ─────
  async getNotifications(req, res, next) {
    try {
      res.json(await this.getWorkerNotificationsUseCase.execute({ userId: req.user.userId }));
    } catch (e) { next(e); }
  }

  // ── NEW: Worker marks a notification as read ─────────────────────────────
  async markNotificationRead(req, res, next) {
    try {
      res.json(await this.markNotificationReadUseCase.execute({
        notificationId: req.params.notificationId,
        userId: req.user.userId,
      }));
    } catch (e) { next(e); }
  }

  // ── NEW: Worker marks all notifications as read ──────────────────────────
  async markAllNotificationsRead(req, res, next) {
    try {
      await req.app.locals.notificationRepo?.markAllRead(req.user.userId);
      res.json({ message: "All notifications marked as read" });
    } catch (e) { next(e); }
  }
}

module.exports = WorkerController;