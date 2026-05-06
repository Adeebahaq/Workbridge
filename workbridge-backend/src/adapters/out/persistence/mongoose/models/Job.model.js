const mongoose = require("mongoose");
const { WORKER_REJECTION_REASONS } = require("../../../../../shared/constants");

const StatusHistorySchema = new mongoose.Schema(
  { status:    { type: String, required: true },
    changedAt: { type: Date,   required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note:      { type: String } },
  { _id: false }
);

const JobSchema = new mongoose.Schema(
  { employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User",        required: true },
    workerId:   { type: mongoose.Schema.Types.ObjectId, ref: "User",        required: true },
    serviceId:  { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", required: true },
    hiringType: { type: String, required: true, enum: ["Hourly","Daily","Weekly","Monthly"] },
    jobDate:    { type: Date,   required: true },
    startDate:  { type: Date },
    endDate:    { type: Date },
    quantity:      { type: Number, min: 1 },   // ← NEW: hours for Hourly, days for Daily
    description:   { type: String, maxlength: 300 },
    estimatedCost: { type: Number, min: 0 },
    status: { type: String, required: true, default: "Requested",
              enum: ["Requested","Accepted","In Progress","Awaiting Confirmation",
                     "Completed","Rejected","Cancelled","Expired"] },
    statusHistory:         { type: [StatusHistorySchema], default: [] },
    workerRejectionReason: { type: String, enum: WORKER_REJECTION_REASONS },
    cancelledByEmployerAt: { type: Date },
    requestExpiresAt:      { type: Date },
    markedDoneAt:          { type: Date },
    confirmationExpiresAt: { type: Date },
    employerConfirmedAt:   { type: Date },
    autoCompletedAt:       { type: Date } },
  { timestamps: true, collection: "jobs" }
);

JobSchema.index({ workerId: 1,   status: 1 }, { name: "idx_jobs_worker_status"   });
JobSchema.index({ employerId: 1, status: 1 }, { name: "idx_jobs_employer_status" });
JobSchema.index({ requestExpiresAt: 1 },
  { name: "idx_jobs_request_expiry", partialFilterExpression: { status: "Requested" } });
JobSchema.index({ confirmationExpiresAt: 1 },
  { name: "idx_jobs_confirmation_expiry", partialFilterExpression: { status: "Awaiting Confirmation" } });
JobSchema.index({ serviceId: 1 },           { name: "idx_jobs_service_id"   });
JobSchema.index({ status: 1, jobDate: -1 }, { name: "idx_jobs_status_date"  });
JobSchema.index({ createdAt: -1 },          { name: "idx_jobs_created_desc" });

module.exports = mongoose.model("Job", JobSchema);