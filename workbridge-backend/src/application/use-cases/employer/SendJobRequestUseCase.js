const AppError = require("../../../shared/errors/AppError");

class SendJobRequestUseCase {
  constructor(jobRepository, workerRepository, notificationRepository) {
    this.jobRepository          = jobRepository;
    this.workerRepository       = workerRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ employerId, workerId, serviceId, hiringType, jobDate, startDate, endDate, description, estimatedCost: clientCost, quantity }) {
    if (!workerId || !serviceId || !hiringType || !jobDate)
      throw new AppError("workerId, serviceId, hiringType, and jobDate are required", 400);

    if (!["Hourly", "Daily", "Weekly", "Monthly"].includes(hiringType))
      throw new AppError("Invalid hiringType", 400);

    if (["Weekly", "Monthly"].includes(hiringType) && (!startDate || !endDate))
      throw new AppError("startDate and endDate are required for Weekly/Monthly hiring", 400);

  const jobDateObj = new Date(jobDate);
const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
if (jobDateObj < todayStart)
  throw new AppError("Job date cannot be in the past", 400);

    const worker = await this.workerRepository.findByUserId(workerId);
    if (!worker || worker.status !== "Active")
      throw new AppError("Worker is not available", 404);

    const estimatedCost = clientCost ?? 0;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const job = await this.jobRepository.save({
      employerId,
      workerId,
      serviceId,
      hiringType,
      jobDate:          jobDateObj,
      startDate:        startDate ? new Date(startDate) : undefined,
      endDate:          endDate   ? new Date(endDate)   : undefined,
      quantity:         quantity  ? Number(quantity)    : undefined,  // ← hours or days
      description,
      estimatedCost,
      status:           "Requested",
      requestExpiresAt: expiresAt,
      statusHistory: [{ status: "Requested", changedAt: new Date(), changedBy: employerId }],
    });

    await this.notificationRepository.save({
      userId:       workerId,
      type:         "job_request_received",
      title:        "New Job Request",
      body:         `You have a new ${hiringType} job request for ${new Date(jobDate).toDateString()}.`,
      relatedJobId: job._id,
    });

    return job;
  }
}

module.exports = SendJobRequestUseCase;