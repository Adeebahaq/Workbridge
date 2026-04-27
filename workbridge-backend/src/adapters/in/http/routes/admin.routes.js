const { Router } = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const WorkerProfile = require("../../../out/persistence/mongoose/models/WorkerProfile.model");

module.exports = function(controller) {
  const router = Router();
  router.use(authMiddleware, roleMiddleware("admin"));

  // ── Dashboard overview ──────────────────────────────────────────────────────
  router.get("/dashboard", (req, res, next) => controller.getDashboard(req, res, next));

  // ── Worker approve / reject / create ───────────────────────────────────────
  router.patch("/workers/:workerId/approve", (req, res, next) => controller.approveWorker(req, res, next));
  router.patch("/workers/:workerId/reject",  (req, res, next) => controller.rejectWorker(req, res, next));
  router.post("/workers",                    (req, res, next) => controller.createWorker(req, res, next));

  // ── Pending verifications list ──────────────────────────────────────────────
  router.get("/workers/pending", async (req, res, next) => {
    try {
      const pending = await WorkerProfile.find({ status: "Pending Verification" })
        .populate("userId", "fullName phone email createdAt")
        .populate("services", "name")
        .sort({ submittedAt: 1 })
        .lean();
      res.json(pending);
    } catch (e) { next(e); }
  });

  // ── All workers (with optional status filter) ───────────────────────────────
  router.get("/workers/all", async (req, res, next) => {
    try {
      const query = {};
      if (req.query.status) query.status = req.query.status;

      const workers = await WorkerProfile.find(query)
        .populate("userId", "fullName phone email createdAt")
        .populate("services", "name")
        .sort({ submittedAt: -1 })
        .lean();
      res.json(workers);
    } catch (e) { next(e); }
  });

  // ── Single worker detail (for admin review modal) ───────────────────────────
  router.get("/workers/:workerId", async (req, res, next) => {
    try {
      const worker = await WorkerProfile.findById(req.params.workerId)
        .populate("userId", "fullName phone email createdAt isWhatsappVerified")
        .populate("services", "name")
        .lean();
      if (!worker) return res.status(404).json({ message: "Worker not found" });
      res.json(worker);
    } catch (e) { next(e); }
  });

  // ── Suspend / unsuspend worker ──────────────────────────────────────────────
  router.patch("/workers/:workerId/suspend", async (req, res, next) => {
    try {
      const worker = await WorkerProfile.findByIdAndUpdate(
        req.params.workerId,
        { $set: { status: "Suspended", statusUpdatedAt: new Date(), adminReviewedBy: req.user.userId, adminReviewedAt: new Date() } },
        { new: true }
      ).lean();
      if (!worker) return res.status(404).json({ message: "Worker not found" });
      res.json(worker);
    } catch (e) { next(e); }
  });

  router.patch("/workers/:workerId/activate", async (req, res, next) => {
    try {
      const worker = await WorkerProfile.findByIdAndUpdate(
        req.params.workerId,
        { $set: { status: "Active", statusUpdatedAt: new Date(), adminReviewedBy: req.user.userId, adminReviewedAt: new Date() } },
        { new: true }
      ).lean();
      if (!worker) return res.status(404).json({ message: "Worker not found" });
      res.json(worker);
    } catch (e) { next(e); }
  });

  return router;
};