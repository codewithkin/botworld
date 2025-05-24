const {Client, LocalAuth} = require("whatsapp-web.js");
const qrcode = require("qrcode");
const db = require("./lib/sqlite");
const {OpenAI} = require("openai");
const axios = require("axios"); 

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
    const sessionDir = path.join(__dirname, "../sessions");

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

      console.log("We just received a message:", msg.body);

      if (chat.isReadOnly) {
        return;
      }

      if (chat.isGroup) return;
      if (msg.fromMe || !msg.body) return;

      // Cache implementation can be added later if needed
      // For now, we'll skip caching to keep it simple

      const assistantId = await db.getBotConfig(botId, "assistantId");
      if (!assistantId) return;

      const thread = await openai.beta.threads.create();
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Message from ${msg.from}: ${msg.body}`,
      });

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find((m) => m.role === "assistant")
        ?.content[0]?.text?.value;

      if (assistantMessage) {
        await msg.reply(assistantMessage);

        const userId = await db.getBotConfig(botId, "userId");
        const messageData = {
          botId,
          userId,
          sender: msg.from,
          contentSnippet: msg.body.slice(0, 300),
          reply: assistantMessage,
          fallback: false,
        };

        axios
          .post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messages`, messageData)
          .catch((error) => console.error("Failed to save message:", error));
      }
    } catch (error) {
      console.error(`Message handling error for bot ${botId}:`, error);
      if (socket) socket.emit("error", "Failed to process message");
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
