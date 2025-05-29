import express, {Request, Response} from "express";
import {createServer} from "http";
import {Server as IoServer} from "socket.io";
import {createWhatsAppClient} from "./manager/whatsapp-manager";
import cors from "cors";

// Better-auth
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth";

const app = express();
const httpServer = createServer(app);

// Add better-auth endpoints
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Configure CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://app.botworld.pro"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const io = new IoServer(httpServer, {
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
  const botId = socket.handshake.auth.botId as string;
  const userId = socket.handshake.auth.userId as string;
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

  socket.on(
    "authenticate",
    async ({botId: clientBotId, userId: clientUserId, assistantId}) => {
      try {
        console.log("User id: ", clientUserId);
        console.log("Assistant id: ", assistantId);

        if (!clientUserId || !assistantId) {
          console.error("Both userId and assistantId are required");
          socket.emit("error", "Both userId and assistantId are required");
          return;
        }

        console.log("Setting values: ", {
          botId: clientBotId,
          userId: clientUserId,
          assistantId,
        });

        // await db.setBotConfig(clientBotId, "userId", clientUserId);
        // await db.setBotConfig(clientBotId, "assistantId", assistantId);

        console.log(`Stored IDs for bot ${clientBotId}`);
        console.log(
          `User ${clientUserId} authenticated for bot ${clientBotId}`
        );
      } catch (error) {
        console.error("Authentication storage failed:", error);
        socket.emit("error", "Failed to store authentication data");
      }
    }
  );

  socket.on("disconnect", (reason) => {
    console.log(`Disconnected (${reason}) from bot: ${botId}`);
  });
});

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`);
});
