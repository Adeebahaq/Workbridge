class JobController {
  constructor({ getMyJobsUseCase, getJobUseCase }) {
    this.getMyJobsUseCase = getMyJobsUseCase;
    this.getJobUseCase    = getJobUseCase;
  }
  async getMyJobs(req, res, next) {
    try { res.json(await this.getMyJobsUseCase.execute({ userId: req.user.userId, role: req.user.role })); }
    catch (e) { next(e); }
  }
  async getJob(req, res, next) {
    try { res.json(await this.getJobUseCase.execute({ jobId: req.params.jobId })); }
    catch (e) { next(e); }
  }
}
module.exports = JobController;
