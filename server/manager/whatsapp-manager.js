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
exports.activeClients = void 0;
exports.initializeExistingBots = initializeExistingBots;
exports.createWhatsAppClient = createWhatsAppClient;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_1 = __importDefault(require("qrcode"));
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getBotConfig_1 = __importDefault(require("../functions/db/getBotConfig"));
const auth_1 = require("../lib/auth");
dotenv_1.default.config();
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const activeClients = new Map();
exports.activeClients = activeClients;
function initializeExistingBots() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sessionDir = path_1.default.join(__dirname, "./sessions/session");
            if (!fs_1.default.existsSync(sessionDir)) {
                return;
            }
            const sessionFiles = fs_1.default.readdirSync(sessionDir);
            for (const file of sessionFiles) {
                if (file.endsWith(".json")) {
                    const botId = file.replace(".json", "");
                    console.log(`Initializing existing bot: ${botId}`);
                    try {
                        const client = yield createWhatsAppClient(botId);
                        activeClients.set(botId, client);
                        console.log(`Successfully initialized bot: ${botId}`);
                    }
                    catch (error) {
                        console.error(`Failed to initialize bot ${botId}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.error("Error initializing existing bots:", error);
        }
    });
}
function createWhatsAppClient(botId, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        if (activeClients.has(botId)) {
            return activeClients.get(botId);
        }
        const client = new whatsapp_web_js_1.Client({
            puppeteer: {
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            },
            authStrategy: new whatsapp_web_js_1.LocalAuth({
                clientId: botId,
                dataPath: "sessions",
            }),
        });
        client.on("auth_failure", (msg) => {
            console.error(`Auth failure for bot ${botId}:`, msg);
            activeClients.delete(botId);
            if (socket)
                socket.emit("error", "WhatsApp authentication failed");
        });
        client.on("disconnected", (reason) => {
            console.log(`Client disconnected for bot ${botId}:`, reason);
            activeClients.delete(botId);
            if (socket)
                socket.emit("status", "Disconnected - Reconnecting...");
            setTimeout(() => createWhatsAppClient(botId), 5000);
        });
        client.on("qr", (qr) => __awaiter(this, void 0, void 0, function* () {
            if (socket) {
                const qrImage = yield qrcode_1.default.toDataURL(qr);
                socket.emit("qr", qrImage);
            }
        }));
        client.on("authenticated", () => {
            if (socket)
                socket.emit("status", "connected");
        });
        client.on("ready", () => {
            console.log(`WhatsApp client ready for bot: ${botId}`);
            if (socket)
                socket.emit("status", "Connected to WhatsApp");
        });
        client.on("message", (msg) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const chat = yield msg.getChat();
                if (chat.isReadOnly || chat.isGroup || msg.fromMe || !msg.body)
                    return;
                const assistantId = yield (0, getBotConfig_1.default)(botId, "assistantId");
                if (!assistantId)
                    return;
                const existingChat = yield auth_1.prisma.chat.findFirst({
                    where: {
                        from: msg.from,
                        bots: { some: { id: botId } },
                    },
                    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
                });
                let threadId;
                if (existingChat) {
                    threadId = existingChat.threadId;
                }
                else {
                    const newThread = yield openai.beta.threads.create();
                    threadId = newThread.id;
                    yield auth_1.prisma.chat.create({
                        data: {
                            name: `Chat with ${msg.from}`,
                            from: msg.from,
                            threadId: threadId,
                            userId: yield (0, getBotConfig_1.default)(botId, "userId"),
                            bots: { connect: { id: botId } },
                        },
                    });
                }
                yield openai.beta.threads.messages.create(threadId, {
                    role: "user",
                    content: msg.body,
                });
                const run = yield openai.beta.threads.runs.create(threadId, {
                    assistant_id: assistantId,
                });
                let runStatus;
                do {
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                    runStatus = yield openai.beta.threads.runs.retrieve(threadId, run.id);
                } while (runStatus.status !== "completed");
                const messages = yield openai.beta.threads.messages.list(threadId);
                const assistantMessage = (_c = (_b = (_a = messages.data.find((m) => m.role === "assistant")) === null || _a === void 0 ? void 0 : _a.content[0]) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.value;
                if (assistantMessage) {
                    yield msg.reply(assistantMessage);
                    yield openai.beta.threads.messages.create(threadId, {
                        role: "assistant",
                        content: assistantMessage,
                    });
                    const chatRecord = yield auth_1.prisma.chat.findFirstOrThrow({
                        where: { threadId },
                    });
                    yield auth_1.prisma.message.createMany({
                        data: [
                            {
                                botId,
                                userId: chatRecord.userId,
                                chatId: chatRecord.id,
                                sender: msg.from,
                                contentSnippet: msg.body.slice(0, 300),
                                reply: null,
                                fallback: false,
                            },
                            {
                                botId,
                                userId: chatRecord.userId,
                                chatId: chatRecord.id,
                                sender: botId,
                                contentSnippet: assistantMessage.slice(0, 300),
                                reply: assistantMessage,
                                fallback: false,
                            },
                        ],
                    });
                }
            }
            catch (error) {
                console.error("Message processing error:", {
                    error: error.message,
                    stack: error.stack,
                    metadata: {
                        botId,
                        sender: msg === null || msg === void 0 ? void 0 : msg.from,
                        message: msg === null || msg === void 0 ? void 0 : msg.body,
                    },
                });
            }
        }));
        yield client.initialize();
        activeClients.set(botId, client);
        return client;
    });
}
