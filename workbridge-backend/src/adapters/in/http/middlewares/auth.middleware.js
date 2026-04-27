const { verifyToken } = require("../../../../shared/utils/jwt");
const AppError        = require("../../../../shared/errors/AppError");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("No token provided", 401));
  }
  try {
    req.user = verifyToken(header.split(" ")[1]);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Session expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token", 401));
  }
}

module.exports = { authMiddleware };