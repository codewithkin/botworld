// server.js
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

// Initialize existing bots when Redis connects
redis.on("connect", async () => {
  console.log("Connected to Redis");
  try {
    const {initializeExistingBots} = require("./whatsapp-manager");
    await initializeExistingBots();
  } catch (error) {
    console.error("Error initializing bots:", error);
  }
});

redis.on("error", (err) => console.error("Redis error:", err));

io.on("connection", (socket) => {
  const botId = socket.handshake.auth.botId;
  console.log(`New connection for bot: ${botId}`);

  socket.on("init", async () => {
    try {
      const client = await createWhatsAppClient(botId, socket);
      socket.emit("status", "Initializing WhatsApp connection...");
    } catch (error) {
      console.error(`Init error for bot ${botId}:`, error);
      socket.emit("error", "Failed to initialize client");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Disconnected (${reason}) from bot: ${botId}`);
  });
});

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`);
});
