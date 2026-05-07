require('dotenv').config();
console.log("URI:", process.env.MONGO_URI);
const { connectDB }   = require("./infrastructure/config/database");
const { createApp }   = require("./infrastructure/config/app");
const { createServer } = require("http");
const { Server }      = require("socket.io");
const container       = require("./infrastructure/container");
const ChatSocket      = require("./adapters/in/sockets/ChatSocket");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();
    const app = createApp();
    const httpServer = createServer(app);
    const io = new Server(httpServer, { cors: { origin: "*" } });

    // ✅ Make io globally accessible so use cases can emit events
    global.io = io;

    const chatSocket = new ChatSocket(container);
    chatSocket.init(io);

    httpServer.listen(PORT, () =>
      console.log(`✅ WorkBridge backend running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}

bootstrap();