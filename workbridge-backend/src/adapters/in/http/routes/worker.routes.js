const { Router }         = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const upload             = require("../middlewares/upload.middleware");
const WorkerProfile      = require("../../../out/persistence/mongoose/models/WorkerProfile.model");

module.exports = function(controller) {
  const router = Router();

  // Public: verified workers list (shown on home page)
  router.get("/verified", async (req, res, next) => {
    try {
      const workers = await WorkerProfile.find({ status: "Active" })
        .populate("userId", "fullName phone")
        .populate("services", "name")
        .select("userId services employmentType preferredCity availabilityBadge averageRating totalCompletedJobs")
        .sort({ averageRating: -1 })
        .limit(12)
        .lean();
      res.json(workers);
    } catch (e) { next(e); }
  });

  // Public: worker self-registration with optional CNIC image upload
  router.post(
    "/register",
    upload.single("cnicFrontImage"),
    (req, res, next) => controller.register(req, res, next)
  );

  // Protected: get own profile
  router.get(
    "/me",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.getMe(req, res, next)
  );

  // Protected: update availability / location
  router.patch(
    "/availability",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.updateAvailability(req, res, next)
  );

  // ── NEW: update service pricing ──────────────────────────────────────────
  router.patch(
    "/pricing",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.updatePricing(req, res, next)
  );

  router.patch(
    "/jobs/:jobId/accept",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.acceptJob(req, res, next)
  );

  router.patch(
    "/jobs/:jobId/reject",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.rejectJob(req, res, next)
  );

  router.patch(
    "/jobs/:jobId/done",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.markJobDone(req, res, next)
  );

  return router;
};