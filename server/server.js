const express = require("express");
const {createServer} = require("http");
const {Server} = require("socket.io");
const redis = require("./redis");
const {createWhatsAppClient} = require("./whatsapp-manager");


const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://botworld.pro"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  transports: ["websocket", "polling"],
});

// Redis connection
redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("Redis error:", err));

io.on("connection", (socket) => {
  const botId = socket.handshake.auth.botId;
  console.log(`New connection for bot: ${botId}`);

  // Immediately set up init handler
  socket.on("init", async () => {
    try {
      console.log(`Initializing WhatsApp client for bot: ${botId}`);
      const client = await createWhatsAppClient(botId, socket);
      socket.emit("status", "Initializing WhatsApp connection...");
    } catch (error) {
      console.error(`Init error for bot ${botId}:`, error);
      socket.emit("error", "Failed to initialize client");
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`Disconnected (${reason}) from bot: ${botId}`);
    redis.del(`whatsapp:${botId}:session`);
  });

  // Add error handling
  socket.on("error", (error) => {
    console.error(`Socket error for bot ${botId}:`, error);
  });
});

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`);
});
