class EmployerController {
  constructor({ searchWorkersUseCase, sendJobRequestUseCase, cancelJobUseCase, confirmJobUseCase, rateWorkerUseCase }) {
    this.searchWorkersUseCase  = searchWorkersUseCase;
    this.sendJobRequestUseCase = sendJobRequestUseCase;
    this.cancelJobUseCase      = cancelJobUseCase;
    this.confirmJobUseCase     = confirmJobUseCase;
    this.rateWorkerUseCase     = rateWorkerUseCase;
  }
  async searchWorkers(req, res, next) {
    try { res.json(await this.searchWorkersUseCase.execute(req.query)); }
    catch (e) { next(e); }
  }
  async sendJobRequest(req, res, next) {
    try { res.status(201).json(await this.sendJobRequestUseCase.execute({ employerId: req.user.userId, ...req.body })); }
    catch (e) { next(e); }
  }
  async cancelJob(req, res, next) {
    try { res.json(await this.cancelJobUseCase.execute({ jobId: req.params.jobId, employerId: req.user.userId })); }
    catch (e) { next(e); }
  }
  async confirmJob(req, res, next) {
    try { res.json(await this.confirmJobUseCase.execute({ jobId: req.params.jobId, employerId: req.user.userId })); }
    catch (e) { next(e); }
  }
  async rateWorker(req, res, next) {
    try { res.status(201).json(await this.rateWorkerUseCase.execute({ employerId: req.user.userId, ...req.body })); }
    catch (e) { next(e); }
  }
}
module.exports = EmployerController;
