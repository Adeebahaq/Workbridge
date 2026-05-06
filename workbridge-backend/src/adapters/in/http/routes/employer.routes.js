const { Router }         = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

module.exports = function(controller) {
  const router = Router();

  // ── Public routes (no auth needed — guest browsing per FR12) ────────────
  router.get("/workers",                    (req, res, next) => controller.searchWorkers(req, res, next));
  router.get("/workers/:workerId",          (req, res, next) => controller.getWorkerProfile(req, res, next));

  // ── Protected routes (employer only) ────────────────────────────────────
  router.use(authMiddleware, roleMiddleware("employer"));

  // Profile
  router.get("/profile",                   (req, res, next) => controller.getProfile(req, res, next));

  // Jobs
  router.post("/jobs",                     (req, res, next) => controller.sendJobRequest(req, res, next));
  router.get("/jobs",                      (req, res, next) => controller.getMyJobs(req, res, next));
  router.get("/jobs/:jobId",               (req, res, next) => controller.getJob(req, res, next));
  router.patch("/jobs/:jobId/cancel",      (req, res, next) => controller.cancelJob(req, res, next));
  router.patch("/jobs/:jobId/confirm",     (req, res, next) => controller.confirmJob(req, res, next));

  // Ratings
  router.post("/ratings",                  (req, res, next) => controller.rateWorker(req, res, next));

  // Notifications
  router.get("/notifications",             (req, res, next) => controller.getNotifications(req, res, next));
  router.patch("/notifications/:notificationId/read",
                                           (req, res, next) => controller.markNotificationRead(req, res, next));
  router.patch("/notifications/read-all",  (req, res, next) => controller.markAllNotificationsRead(req, res, next));

  return router;
};