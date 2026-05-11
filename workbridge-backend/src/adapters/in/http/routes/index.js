const { Router }     = require("express");
const container      = require("../../../../infrastructure/container");
const ServiceType    = require("../../../out/persistence/mongoose/models/ServiceType.model");
const WorkerProfile  = require("../../../out/persistence/mongoose/models/WorkerProfile.model");
const { authMiddleware }  = require("../middlewares/auth.middleware");
const { roleMiddleware }  = require("../middlewares/role.middleware");

const AuthController     = require("../controllers/AuthController");
const WorkerController   = require("../controllers/WorkerController");
const EmployerController = require("../controllers/EmployerController");
const AdminController    = require("../controllers/AdminController");
const JobController      = require("../controllers/JobController");

const authCtrl     = new AuthController(container);
const workerCtrl   = new WorkerController(container);
const employerCtrl = new EmployerController(container);
const adminCtrl    = new AdminController(container);
const jobCtrl      = new JobController(container);

const authRoutes     = require("./auth.routes")(authCtrl);
const workerRoutes   = require("./worker.routes")(workerCtrl);
const employerRoutes = require("./employer.routes")(employerCtrl);
const adminRoutes    = require("./admin.routes")(adminCtrl);
const jobRoutes      = require("./job.routes")(jobCtrl);
const ttsRouter = require("./tts");

const router = Router();

// Expose notificationRepo on app.locals so EmployerController.markAllNotificationsRead can use it
router.use((req, res, next) => {
  req.app.locals.notificationRepo = container.notificationRepo;
  next();
});

// ── Public: service types list ───────────────────────────────────────────────
router.get("/services", async (req, res, next) => {
  try {
    const services = await ServiceType.find({ isActive: true }).lean();
    res.json(services);
  } catch (e) { next(e); }
});

// ── Public: verified workers preview (MUST be before router.use("/workers"...)) ──
router.get("/workers/verified", async (req, res, next) => {
  try {
    const workers = await WorkerProfile.find({ status: "Active" })
      .populate("userId",   "fullName phone")
      .populate("services", "name")
      .select("userId services employmentType preferredCity availabilityBadge averageRating totalCompletedJobs")
      .sort({ averageRating: -1 })
      .limit(12)
      .lean();
    res.json(workers);
  } catch (e) { next(e); }
});

router.use("/auth",      authRoutes);
router.use("/workers",   workerRoutes);
router.use("/employers", employerRoutes);
router.use("/admin",     adminRoutes);
router.use("/jobs",      jobRoutes);
router.use("/tts", ttsRouter);

module.exports = router;