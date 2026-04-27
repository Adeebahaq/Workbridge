const { Router }         = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");

module.exports = function(controller) {
  const router = Router();
  router.post("/login",             (req, res, next) => controller.login(req, res, next));
  router.post("/register/employer", (req, res, next) => controller.registerEmployer(req, res, next));
  router.post("/register/worker",   (req, res, next) => controller.registerWorker(req, res, next));
  router.post("/verify-otp",        (req, res, next) => controller.verifyOtp(req, res, next));
  router.post("/resend-otp",        (req, res, next) => controller.resendOtp(req, res, next));
  // Protected: returns decoded JWT payload so the frontend can refresh UI state
  router.get("/me", authMiddleware, (req, res) => res.json(req.user));
  return router;
};
