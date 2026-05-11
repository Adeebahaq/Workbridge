const { Router }         = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { upload }         = require("../middlewares/upload.middleware");
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

  // Public: 5-star employer reviews for homepage
  router.get("/public-reviews", async (req, res, next) => {
    try {
      const Rating = require("../../../out/persistence/mongoose/models/Rating.model");
      const User   = require("../../../out/persistence/mongoose/models/User.model");

      const ratings = await Rating.find({ stars: 5, feedback: { $exists: true, $ne: "" } })
        .sort({ submittedAt: -1 })
        .limit(6)
        .lean();

      const results = [];
      for (const r of ratings) {
        const employer = await User.findById(r.employerId).select("fullName").lean();
        if (!employer) continue;
        results.push({
          stars:        r.stars,
          feedback:     r.feedback,
          employerName: employer.fullName,
          submittedAt:  r.submittedAt,
        });
      }

      res.json(results);
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

  // Ratings
  router.get(
    "/ratings",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.getMyRatings(req, res, next)
  );

  // Notifications — ⚠️ read-all MUST come before :notificationId/read
  router.get(
    "/notifications",
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.getNotifications(req, res, next)
  );

  router.patch(
    "/notifications/read-all",              // ✅ specific route first
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.markAllNotificationsRead(req, res, next)
  );

  router.patch(
    "/notifications/:notificationId/read",  // ✅ parameterized route second
    authMiddleware, roleMiddleware("worker"),
    (req, res, next) => controller.markNotificationRead(req, res, next)
  );

  return router;
};