const { Router } = require("express");
const ServiceType = require("../../out/persistence/mongoose/models/ServiceType.model");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const services = await ServiceType.find({ isActive: true }).lean();
    return res.status(200).json(services);
  } catch (e) {
    next(e);
  }
});

module.exports = router;