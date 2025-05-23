const {Client, LocalAuth} = require("whatsapp-web.js");
const qrcode = require("qrcode");
const redis = require("./redis");
const {OpenAI} = require("openai");

require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const activeClients = new Map();

async function initializeExistingBots() {
  try {
    const keys = await redis.keys("whatsapp:*:session");

    for (const key of keys) {
      const botId = key.split(":")[1];
      console.log(`Initializing existing bot: ${botId}`);

      try {
        const client = await createWhatsAppClient(botId);
        activeClients.set(botId, client);
        console.log(`Successfully initialized bot: ${botId}`);
      } catch (error) {
        console.error(`Failed to initialize bot ${botId}:`, error);
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
      dataPath: "sessions",
    }),
  });

  const savedSession = await redis.get(`whatsapp:${botId}:session`);
  if (savedSession) {
    client.authStrategy.restore({session: JSON.parse(savedSession)});
  }

  client.on("auth_failure", (msg) => {
    console.error(`Auth failure for bot ${botId}:`, msg);
    activeClients.delete(botId);
    redis.del(`whatsapp:${botId}:session`);
    if (socket) socket.emit("error", "WhatsApp authentication failed");
  });

  client.on("disconnected", (reason) => {
    console.log(`Client disconnected for bot ${botId}:`, reason);
    activeClients.delete(botId);
    redis.del(`whatsapp:${botId}:session`);
    if (socket) socket.emit("status", "Disconnected - Reconnecting...");
    setTimeout(() => createWhatsAppClient(botId), 5000); // Reconnect after 5 seconds
  });

  client.on("qr", async (qr) => {
    if (socket) {
      const qrImage = await qrcode.toDataURL(qr);
      socket.emit("qr", qrImage);
    }
  });

  client.on("authenticated", (session) => {
    redis.set(`whatsapp:${botId}:session`, JSON.stringify(session));
    if (socket) socket.emit("status", "connected");
  });

  client.on("ready", () => {
    console.log(`WhatsApp client ready for bot: ${botId}`);
    if (socket) socket.emit("status", "Connected to WhatsApp");
  });

  client.on("message", async (msg) => {
    try {
      if (!msg.body) return;

      console.log("We just received a message: ", msg);

      const chat = await msg.getChat();
      const contact = await msg.getContact();

      const assistantId = await redis.get(`bot:${botId}:assistantId`);
      if (!assistantId) {
        console.error(`No assistant found for bot: ${botId}`);
        return;
      }

      const thread = await openai.beta.threads.create();

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `User data: ${contact}, chat: ${chat}, message: ${msg.body}`,
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
