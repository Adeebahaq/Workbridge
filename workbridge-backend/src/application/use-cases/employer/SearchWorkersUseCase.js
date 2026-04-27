class SearchWorkersUseCase {
  constructor(workerRepository) {
    this.workerRepository = workerRepository;
  }

  async execute(filters) {
    // If caller wants all workers with status info (admin/employer listing)
    if (filters.listAll === "true" || filters.listAll === true) {
      return this.workerRepository.listAll(filters);
    }
    // Default: active-only filtered search (existing behaviour)
    return this.workerRepository.search(filters);
  }
}

module.exports = SearchWorkersUseCase;