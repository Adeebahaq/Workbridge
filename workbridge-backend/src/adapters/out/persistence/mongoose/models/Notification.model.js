const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../../../../../shared/constants");

const NotificationSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:   { type: String, required: true, enum: NOTIFICATION_TYPES },
    title:  { type: String, required: true },
    body:   { type: String, required: true },
    relatedJobId:    { type: mongoose.Schema.Types.ObjectId, ref: "Job"  },
    relatedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRead:               { type: Boolean, default: false },
    readAt:               { type: Date },
    deliveredViaWhatsapp: { type: Boolean, default: false },
    whatsappDeliveredAt:  { type: Date } },
  { timestamps: { createdAt: "sentAt", updatedAt: false }, collection: "notifications" }
);

NotificationSchema.index({ userId: 1, isRead: 1, sentAt: -1 }, { name: "idx_notifications_user_unread" });
NotificationSchema.index({ relatedJobId: 1 },                  { name: "idx_notifications_job"         });
NotificationSchema.index({ sentAt: -1 },                       { name: "idx_notifications_sent_desc"   });

module.exports = mongoose.model("Notification", NotificationSchema);
