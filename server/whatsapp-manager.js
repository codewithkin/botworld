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
      // 1. Ignore group messages if not mentioned
      const chat = await msg.getChat();

      if (chat.isGroup) return;

      // 2. Ignore own messages and non-text
      if (msg.fromMe || !msg.body) return;

      // 3. Check if user has opted-in (Redis tracking)
      const isAllowed = await redis.get(`bot:${botId}:allowed:${msg.from}`);
      if (!isAllowed) {
        console.log(`Ignoring message from unauthorized user: ${msg.from}`);
        return;
      }

      // 4. Rate limiting (5 messages/minute per user)
      // const rateKey = `bot:${botId}:rate:${msg.from}`;
      // const currentCount = await redis.incr(rateKey);
      // if (currentCount > 5) {
      //   await msg.reply("⚠️ Too many requests. Please wait a moment.");
      //   await redis.expire(rateKey, 60);
      //   return;
      // }

      // 5. Check if message is a command
      // const isCommand = msg.body.startsWith("!bot");
      // if (!isCommand) return;

      console.log(`Processing valid message from ${msg.from}: ${msg.body}`);

      // 6. Get cached response if available
      const cacheKey = `bot:${botId}:cache:${msg.body}`;
      const cachedResponse = await redis.get(cacheKey);

      if (cachedResponse) {
        await msg.reply(cachedResponse);
        return;
      }

      // Proceed with OpenAI processing
      const assistantId = await redis.get(`bot:${botId}:assistantId`);
      if (!assistantId) {
        console.error(`No assistant found for bot: ${botId}`);
        return;
      }

      // Create thread and process message
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
        // Cache response for 1 hour
        await redis.setex(cacheKey, 3600, assistantMessage);
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
