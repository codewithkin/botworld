// server.js
const express = require("express");
const {createServer} = require("http");
const {Server} = require("socket.io");
const redis = require("./redis");
const {createWhatsAppClient} = require("./whatsapp-manager");
const db = require("./lib/sqlite");

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

io.on("connection", (socket) => {
  const botId = socket.handshake.auth.botId;
  const userId = socket.handshake.auth.userId;
  console.log(`New connection for bot: ${botId}`);

  socket.on("init", async () => {
    try {
      console.log("Initializing bot: ", botId);
      const client = await createWhatsAppClient(botId, socket);
      socket.emit("status", "Initializing WhatsApp connection...");
    } catch (error) {
      console.error(`Init error for bot ${botId}:`, error);
      socket.emit("error", "Failed to initialize client");
    }
  });

  socket.on("authenticate", async ({botId, userId, assistantId}) => {
    try {
      console.log("User id: ", userId);
      console.log("Assistant id: ", assistantId);

      if (!userId || !assistantId) {
        console.error("Both userId and assistantId are required");
        socket.emit("error", "Both userId and assistantId are required");
        return;
      }

      console.log("Setting values: ", {
        botId,
        userId,
        assistantId,
      });

      await db.setBotConfig(botId, "userId", userId);
      await db.setBotConfig(botId, "assistantId", assistantId);

      console.log(`Stored IDs for bot ${botId}`);
      console.log(`User ${userId} authenticated for bot ${botId}`);
    } catch (error) {
      console.error("Authentication storage failed:", error);
      socket.emit("error", "Failed to store authentication data");
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
