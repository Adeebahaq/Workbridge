const { Router } = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");

module.exports = function(controller) {
  const router = Router();
  router.use(authMiddleware);
  router.get("/",       (req, res, next) => controller.getMyJobs(req, res, next));
  router.get("/:jobId", (req, res, next) => controller.getJob(req, res, next));
  return router;
};
