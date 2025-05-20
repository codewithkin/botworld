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
});

// Redis connection
redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("Redis error:", err));

io.on("connection", (socket) => {
  const botId = socket.handshake.query.botId;

  socket.on("init", async () => {
    try {
      const client = await createWhatsAppClient(botId, socket);
      socket.emit("status", "Initializing WhatsApp connection...");
    } catch (error) {
      socket.emit("error", "Failed to initialize client");
    }
  });

  socket.on("disconnect", () => {
    redis.del(`whatsapp:${botId}:session`);
  });
});

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`);
});
