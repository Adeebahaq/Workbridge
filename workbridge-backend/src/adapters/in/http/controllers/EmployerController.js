class EmployerController {
  constructor({
    searchWorkersUseCase,
    getWorkerPublicProfileUseCase,
    sendJobRequestUseCase,
    cancelJobUseCase,
    confirmJobUseCase,
    rateWorkerUseCase,
    getEmployerProfileUseCase,
    getMyJobsUseCase,
    getJobUseCase,
    getEmployerNotificationsUseCase,
    markNotificationReadUseCase,
  }) {
    this.searchWorkersUseCase            = searchWorkersUseCase;
    this.getWorkerPublicProfileUseCase   = getWorkerPublicProfileUseCase;
    this.sendJobRequestUseCase           = sendJobRequestUseCase;
    this.cancelJobUseCase                = cancelJobUseCase;
    this.confirmJobUseCase               = confirmJobUseCase;
    this.rateWorkerUseCase               = rateWorkerUseCase;
    this.getEmployerProfileUseCase       = getEmployerProfileUseCase;
    this.getMyJobsUseCase                = getMyJobsUseCase;
    this.getJobUseCase                   = getJobUseCase;
    this.getEmployerNotificationsUseCase = getEmployerNotificationsUseCase;
    this.markNotificationReadUseCase     = markNotificationReadUseCase;
  }

  // FR14 — Search/browse active workers (public, no auth required for basic browse)
  async searchWorkers(req, res, next) {
    try { res.json(await this.searchWorkersUseCase.execute(req.query)); }
    catch (e) { next(e); }
  }

  // FR12/FR16 — View individual worker public profile
  async getWorkerProfile(req, res, next) {
    try {
      res.json(await this.getWorkerPublicProfileUseCase.execute({ workerId: req.params.workerId }));
    } catch (e) { next(e); }
  }

  // FR17 — Send job request
  async sendJobRequest(req, res, next) {
    try {
      res.status(201).json(
        await this.sendJobRequestUseCase.execute({ employerId: req.user.userId, ...req.body })
      );
    } catch (e) { next(e); }
  }

  // FR20 — Cancel job request (only while Requested)
  async cancelJob(req, res, next) {
    try {
      res.json(
        await this.cancelJobUseCase.execute({ jobId: req.params.jobId, employerId: req.user.userId })
      );
    } catch (e) { next(e); }
  }

  // FR22 — Confirm job done (employer side)
  async confirmJob(req, res, next) {
    try {
      res.json(
        await this.confirmJobUseCase.execute({ jobId: req.params.jobId, employerId: req.user.userId })
      );
    } catch (e) { next(e); }
  }

  // FR25 — Rate worker after completion
  async rateWorker(req, res, next) {
    try {
      res.status(201).json(
        await this.rateWorkerUseCase.execute({ employerId: req.user.userId, ...req.body })
      );
    } catch (e) { next(e); }
  }

  // Employer own profile
  async getProfile(req, res, next) {
    try {
      res.json(await this.getEmployerProfileUseCase.execute({ userId: req.user.userId }));
    } catch (e) { next(e); }
  }

  // Employer's own jobs list (with optional status filter)
  async getMyJobs(req, res, next) {
    try {
      res.json(
        await this.getMyJobsUseCase.execute({ userId: req.user.userId, role: "employer", status: req.query.status })
      );
    } catch (e) { next(e); }
  }

  // Single job detail
  async getJob(req, res, next) {
    try {
      res.json(
        await this.getJobUseCase.execute({ jobId: req.params.jobId, userId: req.user.userId, role: "employer" })
      );
    } catch (e) { next(e); }
  }

  // FR27–FR30 — Get employer notifications
  async getNotifications(req, res, next) {
    try {
      res.json(await this.getEmployerNotificationsUseCase.execute({ userId: req.user.userId }));
    } catch (e) { next(e); }
  }

  // Mark a single notification as read
  async markNotificationRead(req, res, next) {
    try {
      res.json(
        await this.markNotificationReadUseCase.execute({
          notificationId: req.params.notificationId,
          userId: req.user.userId,
        })
      );
    } catch (e) { next(e); }
  }

  // Mark all notifications as read
  async markAllNotificationsRead(req, res, next) {
    try {
      // Direct repo call — simple enough to not need a separate use case
      await req.app.locals.notificationRepo?.markAllRead(req.user.userId);
      res.json({ message: "All notifications marked as read" });
    } catch (e) { next(e); }
  }
}

module.exports = EmployerController;