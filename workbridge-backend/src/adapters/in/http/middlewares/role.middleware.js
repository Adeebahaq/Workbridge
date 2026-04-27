const AppError = require("../../../../shared/errors/AppError");

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return next(new AppError("Access denied", 403));
    next();
  };
}

module.exports = { roleMiddleware };
