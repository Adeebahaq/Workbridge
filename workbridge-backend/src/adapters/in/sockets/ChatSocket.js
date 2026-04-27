const { verifyToken } = require("../../../shared/utils/jwt");

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
      socket.on("join_job", (jobId) => socket.join(`job_${jobId}`));

      socket.on("send_message", async (data) => {
        try {
          const msg = await this.sendMessageUseCase.execute({
            jobId: data.jobId, senderId: socket.user.userId,
            receiverId: data.receiverId, text: data.text,
          });
          io.to(`job_${data.jobId}`).emit("new_message", msg);
        } catch (e) { socket.emit("error", e.message); }
      });

      socket.on("get_messages", async (jobId) => {
        try {
          const msgs = await this.getMessagesUseCase.execute({ jobId });
          socket.emit("messages", msgs);
        } catch (e) { socket.emit("error", e.message); }
      });
    });
  }
}

module.exports = ChatSocket;
