require('dotenv').config();
// ✅ Fix
console.log("URI:", process.env.MONGO_URI);
const { connectDB } = require("./infrastructure/config/database");
const { createApp } = require("./infrastructure/config/app");
const { createServer } = require("http");
const { Server } = require("socket.io");
const container = require("./infrastructure/container");
const ChatSocket = require("./adapters/in/sockets/ChatSocket");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Initialize Express app
    const app = createApp();

    // HTTP + Socket.IO
    const httpServer = createServer(app);
    const io = new Server(httpServer, { cors: { origin: "*" } });

    // Initialize chat socket
    const chatSocket = new ChatSocket(container);
    chatSocket.init(io);

    // Start server
    httpServer.listen(PORT, () => 
      console.log(`✅ WorkBridge backend running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}

bootstrap();