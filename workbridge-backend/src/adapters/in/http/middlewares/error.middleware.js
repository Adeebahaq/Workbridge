const AppError = require('../../../../shared/errors/AppError');

function errorMiddleware(err, req, res, next) {
  // Mongoose validation error → 400
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message).join(". ");
    return res.status(400).json({ status: "error", message: messages });
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ status: "error", message: `${field} already exists` });
  }

  // JWT errors → 401
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }

  // Operational errors (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: "error", message: err.message });
  }

  // Unknown errors — log properly instead of console.error(err) which printed the ugly stack
  console.error("❌ Unexpected error:", err.message);
  return res.status(500).json({ status: "error", message: "Internal server error" });
}

module.exports = { errorMiddleware };