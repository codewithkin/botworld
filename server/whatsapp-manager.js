const {Client, LocalAuth} = require("whatsapp-web.js");
const qrcode = require("qrcode");
const redis = require("./redis");

module.exports.createWhatsAppClient = async (botId, socket) => {
  const client = new Client({
    authStrategy: new LocalAuth({clientId: botId}),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // Check existing session
  const savedSession = await redis.get(`whatsapp:${botId}:session`);
  if (savedSession) {
    client.authStrategy.restore({session: JSON.parse(savedSession)});
  }

  client.on("qr", async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);
    socket.emit("qr", qrImage);
    socket.emit("status", "Scan QR code with your phone");
  });

  client.on("authenticated", (session) => {
    redis.set(`whatsapp:${botId}:session`, JSON.stringify(session));
  });

  client.on("ready", () => {
    socket.emit("status", "connected");
    redis.set(`whatsapp:${botId}:status`, "connected");
  });

  client.on("message", async (msg) => {
    // Handle messages using OpenAI assistant
    const assistantId = await redis.get(`bot:${botId}:assistantId`);
    // Add your message handling logic here
  });

  await client.initialize();
  return client;
};
