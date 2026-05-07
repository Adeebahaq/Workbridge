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
      // ✅ Each user joins their own private room for targeted notifications
      const userId = socket.user?.userId;
      if (userId) socket.join(`user_${userId}`);

      socket.on("join_job", (jobId) => socket.join(`job_${jobId}`));

      socket.on("send_message", async (data) => {
        try {
          const msg = await this.sendMessageUseCase.execute({
            senderId: socket.user.userId,
            receiverId: data.receiverId,
            text: data.text,
          });
          const room = `chat_${makeKey(socket.user.userId, data.receiverId)}`;
          io.to(room).emit("new_message", msg);
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