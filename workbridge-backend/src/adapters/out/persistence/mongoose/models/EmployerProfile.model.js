const mongoose = require("mongoose");

const EmployerProfileSchema = new mongoose.Schema(
  { userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalJobsPosted: { type: Number, default: 0 } },
  { timestamps: true, collection: "employer_profiles" }
);

EmployerProfileSchema.index({ userId: 1 }, { unique: true, name: "idx_employer_userId_unique" });

module.exports = mongoose.model("EmployerProfile", EmployerProfileSchema);
