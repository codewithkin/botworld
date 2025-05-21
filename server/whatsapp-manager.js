// whatsapp-manager.js
const {Client, LocalAuth} = require("whatsapp-web.js");
const qrcode = require("qrcode");
const redis = require("./redis");
const {OpenAI} = require("openai");

require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports.createWhatsAppClient = async (botId, socket) => {
  const client = new Client();

  // Load session if exists
  const savedSession = await redis.get(`whatsapp:${botId}:session`);
  if (savedSession) {
    client.authStrategy.restore({session: JSON.parse(savedSession)});
  }

  client.on("auth_failure", (msg) => {
    console.error(`Auth failure for bot ${botId}:`, msg);
    socket.emit("error", "WhatsApp authentication failed");
  });

  client.on("disconnected", (reason) => {
    console.log(`Client disconnected for bot ${botId}:`, reason);
    socket.emit("status", "Disconnected - Reconnecting...");
    client.initialize();
  });

  client.on("qr", async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);
    socket.emit("qr", qrImage);
  });

  client.on("authenticated", (session) => {
    redis.set(`whatsapp:${botId}:session`, JSON.stringify(session));

    socket.emit("status", "connected");
  });

  client.on("ready", () => {
    console.log(`WhatsApp client ready for bot: ${botId}`);
    socket.emit("status", "Connected to WhatsApp");
  });

  // MESSAGE HANDLING CORE
  client.on("message", async (msg) => {
    try {
      // Ignore own messages and non-text
      if (!msg.body) return;

      console.log("We just received a message: ", msg.body);

      // Get chat metadata
      const chat = await msg.getChat();
      const contact = await msg.getContact();

      // Get assistant ID from Redis
      const assistantId = await redis.get(`bot:${botId}:assistantId`);
      if (!assistantId) {
        console.error(`No assistant found for bot: ${botId}`);
        return;
      }

      // Handle commands
      if (msg.body.startsWith("!")) {
        if (msg.body === "!ping") {
          await msg.reply("🏓 pong");
        }
        return;
      }

      // Create OpenAI thread
      const thread = await openai.beta.threads.create();

      // Add user message to thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `User data: ${contact}, chat: ${chat}, message: ${msg.body}`,
      });

      // Create run with assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
      });

      // Poll for run completion
      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      // Get assistant response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find((m) => m.role === "assistant")
        ?.content[0]?.text?.value;

      // Send response
      if (assistantMessage) {
        await msg.reply(assistantMessage);
      }
    } catch (error) {
      console.error(`Message handling error for bot ${botId}:`, error);
      socket.emit("error", "Failed to process message");
    }
  });

  await client.initialize();
  return client;
};
