"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const whatsapp_manager_1 = require("./whatsapp-manager");
const sqlite_1 = __importDefault(require("./lib/sqlite"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
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
    socket.on("init", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Initializing bot: ", botId);
            const client = yield (0, whatsapp_manager_1.createWhatsAppClient)(botId, socket);
            socket.emit("status", "Initializing WhatsApp connection...");
        }
        catch (error) {
            console.error(`Init error for bot ${botId}:`, error);
            socket.emit("error", "Failed to initialize client");
        }
    }));
    socket.on("authenticate", (_a) => __awaiter(void 0, [_a], void 0, function* ({ botId: clientBotId, userId: clientUserId, assistantId }) {
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
            yield sqlite_1.default.setBotConfig(clientBotId, "userId", clientUserId);
            yield sqlite_1.default.setBotConfig(clientBotId, "assistantId", assistantId);
            console.log(`Stored IDs for bot ${clientBotId}`);
            console.log(`User ${clientUserId} authenticated for bot ${clientBotId}`);
        }
        catch (error) {
            console.error("Authentication storage failed:", error);
            socket.emit("error", "Failed to store authentication data");
        }
    }));
    socket.on("disconnect", (reason) => {
        console.log(`Disconnected (${reason}) from bot: ${botId}`);
    });
});
const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`WhatsApp server running on port ${PORT}`);
});
