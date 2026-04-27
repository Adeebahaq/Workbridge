const mongoose = require("mongoose");

const JobStatSchema = new mongoose.Schema(
  { requested: {type:Number,default:0}, accepted: {type:Number,default:0},
    inProgress:{type:Number,default:0}, awaitingConfirmation:{type:Number,default:0},
    completed: {type:Number,default:0}, rejected: {type:Number,default:0},
    cancelled: {type:Number,default:0}, expired:  {type:Number,default:0} },
  { _id: false }
);

const DashboardSnapshotSchema = new mongoose.Schema(
  { totalWorkers:         { type: Number, default: 0 },
    totalEmployers:       { type: Number, default: 0 },
    activeWorkers:        { type: Number, default: 0 },
    pendingVerifications: { type: Number, default: 0 },
    jobStats: {
      today:     { type: JobStatSchema, default: () => ({}) },
      thisWeek:  { type: JobStatSchema, default: () => ({}) },
      thisMonth: { type: JobStatSchema, default: () => ({}) },
    },
    generatedAt: { type: Date, required: true } },
  { timestamps: false, collection: "dashboard_snapshots" }
);

DashboardSnapshotSchema.index({ generatedAt: -1 }, { name: "idx_snapshot_generated_desc" });

module.exports = mongoose.model("DashboardSnapshot", DashboardSnapshotSchema);
