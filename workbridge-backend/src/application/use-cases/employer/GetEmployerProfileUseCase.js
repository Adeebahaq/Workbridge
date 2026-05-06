const AppError = require("../../../shared/errors/AppError");

class GetEmployerProfileUseCase {
  constructor(userRepository, employerRepository) {
    this.userRepository     = userRepository;
    this.employerRepository = employerRepository;
  }

  async execute({ userId }) {
    const profile = await this.employerRepository.findById(userId);
    if (!profile) throw new AppError("Employer profile not found", 404);
    return profile;
  }
}

module.exports = GetEmployerProfileUseCase;