class AdminController {
  constructor({ approveWorkerUseCase, rejectWorkerUseCase, createWorkerUseCase, getDashboardMetricsUseCase }) {
    this.approveWorkerUseCase       = approveWorkerUseCase;
    this.rejectWorkerUseCase        = rejectWorkerUseCase;
    this.createWorkerUseCase        = createWorkerUseCase;
    this.getDashboardMetricsUseCase = getDashboardMetricsUseCase;
  }
  async approveWorker(req, res, next) {
    try { res.json(await this.approveWorkerUseCase.execute({ targetUserId: req.params.workerId, adminId: req.user.userId })); }
    catch (e) { next(e); }
  }
  async rejectWorker(req, res, next) {
    try { res.json(await this.rejectWorkerUseCase.execute({ targetUserId: req.params.workerId, adminId: req.user.userId, reason: req.body.reason })); }
    catch (e) { next(e); }
  }
  async createWorker(req, res, next) {
    try {
      const { fullName, phone, password, ...workerData } = req.body;
      res.status(201).json(
        await this.createWorkerUseCase.execute({
          adminId: req.user.userId,
          fullName,
          phone,
          password,
          workerData,
        })
      );
    }
    catch (e) { next(e); }
  }
  async getDashboard(req, res, next) {
    try { res.json(await this.getDashboardMetricsUseCase.execute()); }
    catch (e) { next(e); }
  }
}
module.exports = AdminController;