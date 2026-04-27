const mongoose = require("mongoose");

const ServiceTypeSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: "service_types" }
);

ServiceTypeSchema.index({ name: 1 },     { unique: true, name: "idx_service_name_unique" });
ServiceTypeSchema.index({ isActive: 1 },              { name: "idx_service_active"       });

module.exports = mongoose.model("ServiceType", ServiceTypeSchema);
