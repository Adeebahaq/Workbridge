class WorkerController {
  constructor({
    registerWorkerUseCase,
    updateAvailabilityUseCase,
    acceptJobUseCase,
    rejectJobUseCase,
    markJobDoneUseCase,
    verifyWorkerUseCase,
  }) {
    this.registerWorkerUseCase     = registerWorkerUseCase;
    this.updateAvailabilityUseCase = updateAvailabilityUseCase;
    this.acceptJobUseCase          = acceptJobUseCase;
    this.rejectJobUseCase          = rejectJobUseCase;
    this.markJobDoneUseCase        = markJobDoneUseCase;
    this.verifyWorkerUseCase       = verifyWorkerUseCase;
  }

  async register(req, res, next) {
    try {
      const workerData = {
        ...req.body,
        // Pass full image object so use case doesn't have to guess types
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
      // Clean up uploaded file if registration fails
      if (req.file && req.file.path) {
        require("fs").unlink(req.file.path, () => {});
      }
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

  async markJobDone(req, res, next) {
    try {
      res.json(await this.markJobDoneUseCase.execute({
        jobId:    req.params.jobId,
        workerId: req.user.userId,
      }));
    } catch (e) { next(e); }
  }
}

module.exports = WorkerController;