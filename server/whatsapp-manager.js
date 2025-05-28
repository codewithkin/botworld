const {Client, LocalAuth} = require("whatsapp-web.js");
const qrcode = require("qrcode");
const db = require("./lib/sqlite");
const {OpenAI} = require("openai");
const axios = require("axios");
const {prisma} = require("./lib/prisma.js");

require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const activeClients = new Map();

async function initializeExistingBots() {
  try {
    // Since we're using SQLite, we need a different approach to find existing sessions
    // We'll look for session files in the filesystem instead
    const fs = require("fs");
    const path = require("path");
    const sessionDir = path.join(__dirname, "./sessions/session");

    console.log("Session directory: ", fs.readdirSync(sessionDir));

    if (!fs.existsSync(sessionDir)) {
      return;
    }

    const sessionFiles = fs.readdirSync(sessionDir);

    for (const file of sessionFiles) {
      if (file.endsWith(".json")) {
        const botId = file.replace(".json", "");
        console.log(`Initializing existing bot: ${botId}`);

        try {
          const client = await createWhatsAppClient(botId);
          activeClients.set(botId, client);
          console.log(`Successfully initialized bot: ${botId}`);
        } catch (error) {
          console.error(`Failed to initialize bot ${botId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error initializing existing bots:", error);
  }
}

async function createWhatsAppClient(botId, socket) {
  if (activeClients.has(botId)) {
    return activeClients.get(botId);
  }

  const client = new Client({
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    authStrategy: new LocalAuth({
      clientId: botId, // Use botId as clientId for session file naming
      dataPath: "sessions",
    }),
  });

  client.on("auth_failure", (msg) => {
    console.error(`Auth failure for bot ${botId}:`, msg);
    activeClients.delete(botId);
    if (socket) socket.emit("error", "WhatsApp authentication failed");
  });

  client.on("disconnected", (reason) => {
    console.log(`Client disconnected for bot ${botId}:`, reason);
    activeClients.delete(botId);
    if (socket) socket.emit("status", "Disconnected - Reconnecting...");
    setTimeout(() => createWhatsAppClient(botId), 5000);
  });

  client.on("qr", async (qr) => {
    if (socket) {
      const qrImage = await qrcode.toDataURL(qr);
      socket.emit("qr", qrImage);
    }
  });

  client.on("authenticated", () => {
    if (socket) socket.emit("status", "connected");
  });

  client.on("ready", () => {
    console.log(`WhatsApp client ready for bot: ${botId}`);
    if (socket) socket.emit("status", "Connected to WhatsApp");
  });

  client.on("message", async (msg) => {
    try {
      const chat = await msg.getChat();
      console.log("Received message from:", msg.from, "Content:", msg.body);

      if (chat.isReadOnly || chat.isGroup || msg.fromMe || !msg.body) return;

      const assistantId = await db.getBotConfig(botId, "assistantId");
      if (!assistantId) return;

      // Get or create chat thread
      const existingChat = await prisma.chat.findFirst({
        where: {
          from: msg.from,
          bots: {some: {id: botId}},
        },
        include: {messages: {orderBy: {createdAt: "asc"}, take: 20}},
      });

      let threadId;
      if (existingChat) {
        threadId = existingChat.threadId;
        console.log("Using existing chat thread:", threadId);
      } else {
        // Create new chat and thread
        const newThread = await openai.beta.threads.create();
        threadId = newThread.id;

        await prisma.chat.create({
          data: {
            name: `Chat with ${msg.from}`,
            from: msg.from,
            threadId: threadId,
            userId: await db.getBotConfig(botId, "userId"),
            bots: {connect: {id: botId}},
          },
        });
        console.log("Created new chat with thread:", threadId);
      }

      // Add user message to OpenAI thread
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: msg.body,
      });

      // Execute assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Wait for completion
      let runStatus;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      } while (runStatus.status !== "completed");

      // Get assistant response
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find((m) => m.role === "assistant")
        ?.content[0]?.text?.value;

      if (assistantMessage) {
        // Send response
        await msg.reply(assistantMessage);

        // Add assistant response to OpenAI thread
        await openai.beta.threads.messages.create(threadId, {
          role: "assistant",
          content: assistantMessage,
        });

        // Save both messages to database
        const chatRecord = await prisma.chat.findFirstOrThrow({
          where: {threadId},
        });

        await prisma.message.createMany({
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
              sender: botId, // Using botId as sender for AI messages
              contentSnippet: assistantMessage.slice(0, 300),
              reply: assistantMessage,
              fallback: false,
            },
          ],
        });

        console.log("Messages saved to chat:", chatRecord.id);
      }
    } catch (error) {
      console.error("Message processing error:", {
        error: error.message,
        stack: error.stack,
        metadata: {
          botId,
          sender: msg?.from,
          message: msg?.body,
        },
      });
    }
  });

  await client.initialize();
  activeClients.set(botId, client);
  return client;
}

module.exports = {
  createWhatsAppClient,
  initializeExistingBots,
  activeClients,
};
