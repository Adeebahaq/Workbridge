class AuthController {
  constructor({ loginUseCase, registerEmployerUseCase, registerWorkerUseCase, verifyOtpUseCase, resendOtpUseCase }) {
    this.loginUseCase            = loginUseCase;
    this.registerEmployerUseCase = registerEmployerUseCase;
    this.registerWorkerUseCase   = registerWorkerUseCase;
    this.verifyOtpUseCase        = verifyOtpUseCase;
    this.resendOtpUseCase        = resendOtpUseCase;
  }

  async login(req, res, next) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json(result);
    } catch (e) { next(e); }
  }

  async registerEmployer(req, res, next) {
    try {
      const result = await this.registerEmployerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (e) { next(e); }
  }

  async registerWorker(req, res, next) {
    try {
      const result = await this.registerWorkerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (e) { next(e); }
  }

  async verifyOtp(req, res, next) {
    try {
      const result = await this.verifyOtpUseCase.execute(req.body);
      res.json(result);
    } catch (e) { next(e); }
  }

  async resendOtp(req, res, next) {
    try {
      const result = await this.resendOtpUseCase.execute(req.body);
      res.json(result);
    } catch (e) { next(e); }
  }

  // Returns decoded JWT payload — used by frontend after login to get fullName, role etc.
  me(req, res) {
    res.json(req.user);
  }
}

module.exports = AuthController;