const ServiceType = require("../../../out/persistence/mongoose/models/ServiceType.model");

class ServiceController {
  async getServices(req, res) {
    try {
      const services = await ServiceType.find({ isActive: true }).lean();
      return res.status(200).json({
        success: true,
        data: services,
      });
    } catch (err) {
      console.error("Service fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load services",
      });
    }
  }
}

module.exports = ServiceController;