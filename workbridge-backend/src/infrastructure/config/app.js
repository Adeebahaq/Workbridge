const express        = require("express");
const cors           = require("cors");
const routes         = require("../../adapters/in/http/routes");
const { errorMiddleware } = require("../../adapters/in/http/middlewares/error.middleware");

function createApp() {
  const app = express();

app.use(cors({
  origin: ["http://localhost:3000", process.env.CLIENT_URL],
}));
  app.use(express.json());

  // Serve uploaded files statically
  app.use("/uploads", express.static("uploads"));
  

  // All API routes
  app.use("/api/upload", require("../../adapters/in/http/routes/upload.routes"));

  app.use("/api", routes);


  // Centralized error handler (uses AppError.isOperational + statusCode)
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };