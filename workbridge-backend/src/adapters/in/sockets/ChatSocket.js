const { verifyToken } = require("../../../shared/utils/jwt");

function makeKey(a, b) { return [a, b].map(String).sort().join("_"); }

class ChatSocket {
  constructor({ sendMessageUseCase, getMessagesUseCase, notificationRepo }) {
    this.sendMessageUseCase = sendMessageUseCase;
    this.getMessagesUseCase = getMessagesUseCase;
    this.notificationRepo   = notificationRepo; // ✅ now injected from container
  }

  init(io) {
    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        socket.user = verifyToken(token);
        next();
      } catch { next(new Error("Unauthorized")); }
    });

    io.on("connection", (socket) => {
      const userId = socket.user?.userId;
      if (userId) socket.join(`user_${userId}`);

      socket.on("join_chat", ({ otherUserId }) => {
        const room = `chat_${makeKey(String(socket.user.userId), String(otherUserId))}`;
        socket.join(room);
      });

      socket.on("send_message", async (data) => {
        try {
          const msg = await this.sendMessageUseCase.execute({
            senderId:    socket.user.userId,
            receiverId:  data.receiverId,
            text:        data.text || null,
            audioUrl:    data.audioUrl,
            duration:    data.duration,
            messageType: data.messageType,
          });

          const room = `chat_${makeKey(String(socket.user.userId), String(data.receiverId))}`;
          io.to(room).emit("new_message", msg);

          // ✅ Save to DB first — repo emits "new_notification" with real MongoDB _id
          if (this.notificationRepo) {
            const body = msg.messageType === "voice"
              ? "🎙️ Voice message"
              : (msg.text?.length > 80 ? msg.text.slice(0, 80) + "…" : msg.text);

            await this.notificationRepo.save({
              userId: data.receiverId,
              type:   "new_message",
              title:  "New Message",
              body,
              sentAt: msg.createdAt || new Date(),
              isRead: false,
            });
            // No manual io.emit needed — MongoNotificationRepository.save() does it already
          }

        } catch (e) { socket.emit("error", e.message); }
      });

      socket.on("mark_read", async ({ messageId }) => {
        try {
          const msg = await this.getMessagesUseCase.messageRepository.markRead(messageId);
          if (msg) {
            const room = `chat_${makeKey(socket.user.userId, String(msg.senderId))}`;
            io.to(room).emit("message_read", { messageId, readAt: msg.readAt });
          }
        } catch (e) { socket.emit("error", e.message); }
      });

      socket.on("get_messages", async ({ otherUserId }) => {
        try {
          const msgs = await this.getMessagesUseCase.execute({
            userA: socket.user.userId, userB: otherUserId,
          });
          socket.emit("messages", msgs);
        } catch (e) { socket.emit("error", e.message); }
      });
    });
  }
}

module.exports = ChatSocket;