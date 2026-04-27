const mongoose = require("mongoose");
const { ADMIN_ACTIONS } = require("../../../../../shared/constants");

const AdminLogSchema = new mongoose.Schema(
  { adminId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action:       { type: String, required: true, enum: ADMIN_ACTIONS },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason:       { type: String, minlength: [20, "Reason min 20 chars"] },
    metadata:     { type: mongoose.Schema.Types.Mixed } },
  { timestamps: { createdAt: "timestamp", updatedAt: false }, collection: "admin_logs" }
);

AdminLogSchema.index({ adminId: 1,      timestamp: -1 }, { name: "idx_admin_logs_admin_time"  });
AdminLogSchema.index({ targetUserId: 1 },                { name: "idx_admin_logs_target_user" });
AdminLogSchema.index({ action: 1,       timestamp: -1 }, { name: "idx_admin_logs_action_time" });

module.exports = mongoose.model("AdminLog", AdminLogSchema);
