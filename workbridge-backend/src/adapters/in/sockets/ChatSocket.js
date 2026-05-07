const { verifyToken } = require("../../../shared/utils/jwt");

function makeKey(a, b) { return [a, b].map(String).sort().join("_"); }

class ChatSocket {
  constructor({ sendMessageUseCase, getMessagesUseCase }) {
    this.sendMessageUseCase = sendMessageUseCase;
    this.getMessagesUseCase = getMessagesUseCase;
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
      // ✅ Join personal room for notification toasts
      const userId = socket.user?.userId;
      if (userId) socket.join(`user_${userId}`);

      socket.on("join_chat", ({ otherUserId }) => {
        const room = `chat_${makeKey(socket.user.userId, otherUserId)}`;
        socket.join(room);
      });

      socket.on("send_message", async (data) => {
        try {
          const msg = await this.sendMessageUseCase.execute({
            senderId:   socket.user.userId,
            receiverId: data.receiverId,
            text:       data.text,
          });

          const room = `chat_${makeKey(socket.user.userId, data.receiverId)}`;
          io.to(room).emit("new_message", msg);

          // ✅ Push toast notification to receiver's personal room
          io.to(`user_${data.receiverId}`).emit("new_notification", {
            _id:    `msg_${msg._id || Date.now()}`,
            type:   "new_message",
            title:  "New Message",
            body:   msg.text?.length > 80 ? msg.text.slice(0, 80) + "…" : msg.text,
            sentAt: msg.createdAt || new Date().toISOString(),
            isRead: false,
          });

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