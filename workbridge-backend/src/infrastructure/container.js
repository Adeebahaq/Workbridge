// infrastructure/container.js
// Composition Root — the ONLY place that wires concrete adapters to use cases.

// ── Out-adapters (repositories) ─────────────────────────────────────────────
const MongoUserRepository         = require("../adapters/out/persistence/mongoose/repositories/MongoUserRepository");
const MongoWorkerRepository       = require("../adapters/out/persistence/mongoose/repositories/MongoWorkerRepository");
const MongoEmployerRepository     = require("../adapters/out/persistence/mongoose/repositories/MongoEmployerRepository");
const MongoJobRepository          = require("../adapters/out/persistence/mongoose/repositories/MongoJobRepository");
const MongoOtpRepository          = require("../adapters/out/persistence/mongoose/repositories/MongoOtpRepository");
const MongoRatingRepository       = require("../adapters/out/persistence/mongoose/repositories/MongoRatingRepository");
const MongoMessageRepository      = require("../adapters/out/persistence/mongoose/repositories/MongoMessageRepository");
const MongoNotificationRepository = require("../adapters/out/persistence/mongoose/repositories/MongoNotificationRepository");
const MongoAdminLogRepository     = require("../adapters/out/persistence/mongoose/repositories/MongoAdminLogRepository");
const MongoDashboardRepository    = require("../adapters/out/persistence/mongoose/repositories/MongoDashboardRepository");
const MongoServiceTypeRepository  = require("../adapters/out/persistence/mongoose/repositories/MongoServiceTypeRepository");

// ── Out-adapters (external services) ────────────────────────────────────────
const WhatsAppOtpAdapter          = require("../adapters/out/external/WhatsAppOtpAdapter");
const WhatsAppNotificationAdapter = require("../adapters/out/external/WhatsAppNotificationAdapter");

// ── Instantiate adapters ─────────────────────────────────────────────────────
const userRepo         = new MongoUserRepository();
const workerRepo       = new MongoWorkerRepository();
const employerRepo     = new MongoEmployerRepository();
const jobRepo          = new MongoJobRepository();
const otpRepo          = new MongoOtpRepository();
const ratingRepo       = new MongoRatingRepository();
const messageRepo      = new MongoMessageRepository();
const notificationRepo = new MongoNotificationRepository();
const adminLogRepo     = new MongoAdminLogRepository();
const dashboardRepo    = new MongoDashboardRepository();
const serviceTypeRepo  = new MongoServiceTypeRepository();
const whatsAppOtp      = new WhatsAppOtpAdapter();
const whatsAppNotify   = new WhatsAppNotificationAdapter();

// ── Use-case imports ─────────────────────────────────────────────────────────
const LoginUseCase                     = require("../application/use-cases/auth/LoginUseCase");
const RegisterEmployerUseCase          = require("../application/use-cases/auth/RegisterEmployerUseCase");
const VerifyOtpUseCase                 = require("../application/use-cases/auth/VerifyOtpUseCase");
const ResendOtpUseCase                 = require("../application/use-cases/auth/ResendOtpUseCase");
const RegisterWorkerUseCase            = require("../application/use-cases/worker/RegisterWorkerUseCase");
const UpdateAvailabilityUseCase        = require("../application/use-cases/worker/UpdateAvailabilityUseCase");
const AcceptJobUseCase                 = require("../application/use-cases/worker/AcceptJobUseCase");
const RejectJobUseCase                 = require("../application/use-cases/worker/RejectJobUseCase");
const MarkJobDoneUseCase               = require("../application/use-cases/worker/MarkJobDoneUseCase");
const VerifyWorkerUseCase              = require("../application/use-cases/worker/VerifyWorkerUseCase");

const SearchWorkersUseCase             = require("../application/use-cases/employer/SearchWorkersUseCase");
const GetWorkerPublicProfileUseCase    = require("../application/use-cases/employer/GetWorkerPublicProfileUseCase");
const SendJobRequestUseCase            = require("../application/use-cases/employer/SendJobRequestUseCase");
const CancelJobUseCase                 = require("../application/use-cases/employer/CancelJobUseCase");
const ConfirmJobUseCase                = require("../application/use-cases/employer/ConfirmJobUseCase");
const RateWorkerUseCase                = require("../application/use-cases/employer/RateWorkerUseCase");
const GetEmployerProfileUseCase        = require("../application/use-cases/employer/GetEmployerProfileUseCase");
const GetEmployerNotificationsUseCase  = require("../application/use-cases/employer/GetEmployerNotificationsUseCase");
const MarkNotificationReadUseCase      = require("../application/use-cases/employer/MarkNotificationReadUseCase");

const ApproveWorkerUseCase             = require("../application/use-cases/admin/ApproveWorkerUseCase");
const RejectWorkerUseCase              = require("../application/use-cases/admin/RejectWorkerUseCase");
const CreateWorkerUseCase              = require("../application/use-cases/admin/CreateWorkerUseCase");
const GetDashboardMetricsUseCase       = require("../application/use-cases/admin/GetDashboardMetricsUseCase");
const SendMessageUseCase               = require("../application/use-cases/chat/SendMessageUseCase");
const GetMessagesUseCase               = require("../application/use-cases/chat/GetMessagesUseCase");
const GetMyJobsUseCase                 = require("../application/use-cases/job/GetMyJobsUseCase");
const GetJobUseCase                    = require("../application/use-cases/job/GetJobUseCase");

module.exports = {
  // auth
  loginUseCase:            new LoginUseCase(userRepo),
  registerEmployerUseCase: new RegisterEmployerUseCase(userRepo, employerRepo, otpRepo, whatsAppOtp),
  registerWorkerUseCase:   new RegisterWorkerUseCase(userRepo, workerRepo, otpRepo, whatsAppOtp),
  verifyOtpUseCase:        new VerifyOtpUseCase(userRepo, otpRepo),
  resendOtpUseCase:        new ResendOtpUseCase(userRepo, otpRepo, whatsAppOtp),

  // worker
  updateAvailabilityUseCase: new UpdateAvailabilityUseCase(workerRepo),
  acceptJobUseCase:          new AcceptJobUseCase(jobRepo),
  rejectJobUseCase:          new RejectJobUseCase(jobRepo),
  markJobDoneUseCase:        new MarkJobDoneUseCase(jobRepo),
  verifyWorkerUseCase:       new VerifyWorkerUseCase(workerRepo),

  // employer
  searchWorkersUseCase:           new SearchWorkersUseCase(workerRepo),
  getWorkerPublicProfileUseCase:  new GetWorkerPublicProfileUseCase(workerRepo, ratingRepo),
  sendJobRequestUseCase:          new SendJobRequestUseCase(jobRepo, workerRepo, notificationRepo),
  cancelJobUseCase:               new CancelJobUseCase(jobRepo, notificationRepo),
  confirmJobUseCase:              new ConfirmJobUseCase(jobRepo, notificationRepo),
  rateWorkerUseCase:              new RateWorkerUseCase(jobRepo, ratingRepo, workerRepo, notificationRepo),
  getEmployerProfileUseCase:      new GetEmployerProfileUseCase(userRepo, employerRepo),
  getEmployerNotificationsUseCase:new GetEmployerNotificationsUseCase(notificationRepo),
  markNotificationReadUseCase:    new MarkNotificationReadUseCase(notificationRepo),

  // admin
  approveWorkerUseCase:       new ApproveWorkerUseCase(workerRepo, adminLogRepo),
  rejectWorkerUseCase:        new RejectWorkerUseCase(workerRepo, adminLogRepo),
  createWorkerUseCase:        new CreateWorkerUseCase(userRepo, workerRepo, adminLogRepo),
  getDashboardMetricsUseCase: new GetDashboardMetricsUseCase(dashboardRepo),

  // chat
  sendMessageUseCase: new SendMessageUseCase(messageRepo),
  getMessagesUseCase: new GetMessagesUseCase(messageRepo),

  // job
  getMyJobsUseCase: new GetMyJobsUseCase(jobRepo),
  getJobUseCase:    new GetJobUseCase(jobRepo),

  // repositories (passed directly where needed)
  serviceTypeRepo,
  notificationRepo,   // ← exposed so controllers can call markAllRead directly
};