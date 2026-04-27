const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  { jobId:      { type: mongoose.Schema.Types.ObjectId, ref: "Job",  required: true },
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:       { type: String, required: true, maxlength: 500 },
    isRead:     { type: Boolean, default: false },
    readAt:     { type: Date },
    deleteAfter:{ type: Date } },                      // TTL — 90 days after job closes
  { timestamps: { createdAt: "sentAt", updatedAt: false }, collection: "messages" }
);

MessageSchema.index({ jobId: 1,      sentAt: 1 }, { name: "idx_messages_job_time" });
MessageSchema.index({ receiverId: 1, isRead: 1 }, { name: "idx_messages_unread"   });
MessageSchema.index({ deleteAfter: 1 }, { expireAfterSeconds: 0, name: "idx_messages_ttl" });

module.exports = mongoose.model("Message", MessageSchema);
