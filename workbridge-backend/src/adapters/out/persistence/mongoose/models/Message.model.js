const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema(
  { participantKey: { type: String, required: true }, // "smallerId_largerId"
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:       { type: String, required: true, maxlength: 500 },
    isRead:     { type: Boolean, default: false },
    readAt:     { type: Date },
    deleteAfter:{ type: Date } },
  { timestamps: { createdAt: "sentAt", updatedAt: false }, collection: "messages" }
);

MessageSchema.index({ participantKey: 1, sentAt: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });
MessageSchema.index({ deleteAfter: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Message', MessageSchema);