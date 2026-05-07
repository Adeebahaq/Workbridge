const { Router }         = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { upload }            = require("../middlewares/upload.middleware");
const WorkerProfile      = require("../../../out/persistence/mongoose/models/WorkerProfile.model");

module.exports = function(controller) {
  const router = Router();

  // Public: verified workers list
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

  // Public: worker self-registration
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

  // Protected: update availability
  router.patch(
    "/availability",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.updateAvailability(req, res, next)
  );

  // Protected: update pricing
  router.patch(
    "/pricing",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.updatePricing(req, res, next)
  );

  // Protected: job actions
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
    "/jobs/:jobId/start",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.startJob(req, res, next)
  );

  router.patch(
    "/jobs/:jobId/done",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.markJobDone(req, res, next)
  );

  // ── NEW: Ratings ─────────────────────────────────────────────────────────
  router.get(
    "/ratings",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.getMyRatings(req, res, next)
  );

  // ── NEW: Notifications ───────────────────────────────────────────────────
  router.get(
    "/notifications",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.getNotifications(req, res, next)
  );

  router.patch(
    "/notifications/:notificationId/read",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.markNotificationRead(req, res, next)
  );

  router.patch(
    "/notifications/read-all",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.markAllNotificationsRead(req, res, next)
  );

  return router;
};