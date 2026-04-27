const { Router } = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

module.exports = function(controller) {
  const router = Router();
  router.use(authMiddleware, roleMiddleware("employer"));
  router.get("/workers",                (req, res, next) => controller.searchWorkers(req, res, next));
  router.post("/jobs",                  (req, res, next) => controller.sendJobRequest(req, res, next));
  router.patch("/jobs/:jobId/cancel",   (req, res, next) => controller.cancelJob(req, res, next));
  router.patch("/jobs/:jobId/confirm",  (req, res, next) => controller.confirmJob(req, res, next));
  router.post("/ratings",               (req, res, next) => controller.rateWorker(req, res, next));
  return router;
};
