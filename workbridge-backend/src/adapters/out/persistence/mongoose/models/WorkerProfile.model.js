const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    url:        { type: String, required: true },
    fileSize:   { type: Number, min: 1, max: 10485760 }, // 10 MB
    mimeType:   { type: String, enum: ["image/jpeg", "image/png", "image/jpg"] },
    uploadedAt: { type: Date },
  },
  { _id: false }
);

const ServicePricingSchema = new mongoose.Schema(
  {
    serviceId:   { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", required: true },
    hourlyRate:  { type: Number, min: 0 },
    dailyRate:   { type: Number, min: 0 },
    weeklyRate:  { type: Number, min: 0 },
    monthlyRate: { type: Number, min: 0 },
  },
  { _id: false }
);

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fatherSpouseName: { type: String, required: true, trim: true },
    dateOfBirth:      { type: Date, required: true },
    gender:           { type: String, required: true, enum: ["Male", "Female", "Other"] },
    maritalStatus:    { type: String, required: true, enum: ["Single", "Married", "Divorced", "Widowed"], default: "Single" },

    // Pakistani CNIC XXXXX-XXXXXXX-X
    cnicNumber:     { type: String, required: true, match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "CNIC must be XXXXX-XXXXXXX-X"] },
    cnicExpiryDate: { type: Date, required: false }, // optional — not collected in current frontend
    currentAddress: { type: String, required: true, trim: true },

    secondaryPhone:   { type: String },
    permanentAddress: { type: String },
    emergencyContact: { type: String },

    cnicFrontImage: { type: ImageSchema, required: true },
    cnicBackImage:  { type: ImageSchema },

    // ObjectId refs → ServiceType._id
    services: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceType" }],
      required: true,
      validate: { validator: (a) => Array.isArray(a) && a.length >= 1, message: "At least one service required" },
    },
    otherServiceDescription: { type: String, maxlength: 100 },
    servicePricing:          { type: [ServicePricingSchema], default: [] },

    preferredWorkingHours: {
      type: [String],
      default: [],
      enum: ["Morning (6 AM - 2 PM)", "Afternoon (12 PM - 6 PM)", "Evening (4 PM - 10 PM)", "Night Shift", "Flexible"],
    },
    daysAvailable: {
      type: [String],
      required: true,
      validate: { validator: (a) => Array.isArray(a) && a.length >= 1, message: "At least one day required" },
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },

    employmentType: { type: String, required: true, enum: ["Full-time", "Part-time", "On-call/Daily Basis"], default: "Full-time" },
    preferredCity:  { type: String, required: true, trim: true },

    // Not collected in current frontend — optional, defaults to empty
    preferredAreas:    { type: [String], default: [] },
    maxTravelDistance: { type: Number, default: 20 }, // free number, no enum restriction

    status: {
      type: String,
      required: true,
      default: "Pending Verification",
      enum: ["Pending Verification", "Active", "Rejected", "Suspended", "Inactive"],
    },
    statusUpdatedAt:   { type: Date },
    availabilityBadge: { type: String, enum: ["Available", "Busy"], default: "Available" },
    badgeUpdatedAt:    { type: Date },

    averageRating:      { type: Number, default: 0 },
    totalReviews:       { type: Number, default: 0 },
    totalCompletedJobs: { type: Number, default: 0 },

    adminReviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminReviewedAt:      { type: Date },
    adminRejectionReason: { type: String, minlength: [20, "Reason must be at least 20 chars"] },

    submittedAt:         { type: Date, required: true },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingSkipped:   { type: Boolean, default: false },
  },
  { timestamps: true, collection: "worker_profiles" }
);

WorkerProfileSchema.index({ userId: 1 },     { unique: true, name: "idx_worker_userId_unique" });
WorkerProfileSchema.index({ cnicNumber: 1 }, { unique: true, name: "idx_worker_cnic_unique" });
WorkerProfileSchema.index({ preferredCity: 1 },             { name: "idx_worker_location" });
WorkerProfileSchema.index({ averageRating: -1 },
  { name: "idx_worker_active_rating", partialFilterExpression: { status: "Active" } });
WorkerProfileSchema.index({ services: 1,        status: 1 }, { name: "idx_worker_services" });
WorkerProfileSchema.index({ daysAvailable: 1,   status: 1 }, { name: "idx_worker_days" });
WorkerProfileSchema.index({ employmentType: 1,  status: 1 }, { name: "idx_worker_employment_type" });
WorkerProfileSchema.index({ submittedAt: 1 },               { name: "idx_worker_submitted_asc" });

module.exports = mongoose.model("WorkerProfile", WorkerProfileSchema);