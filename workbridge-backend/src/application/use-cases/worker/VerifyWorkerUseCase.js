class VerifyWorkerUseCase {
  constructor(workerRepository) {
    this.workerRepository = workerRepository;
  }
  async execute({ userId }) {
    return this.workerRepository.findById(userId);
  }
}
module.exports = VerifyWorkerUseCase;
