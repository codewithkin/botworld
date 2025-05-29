import {Client, LocalAuth} from "whatsapp-web.js";
import qrcode from "qrcode";
import {OpenAI} from "openai";
import axios from "axios";
import {prisma} from "../../prisma/prisma";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const activeClients = new Map<string, Client>();

export async function initializeExistingBots(): Promise<void> {
  try {
    const sessionDir = path.join(__dirname, "./sessions/session");

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

export async function createWhatsAppClient(
  botId: string,
  socket?: any
): Promise<Client> {
  if (activeClients.has(botId)) {
    return activeClients.get(botId)!;
  }

  const client = new Client({
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    authStrategy: new LocalAuth({
      clientId: botId,
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

      if (chat.isReadOnly || chat.isGroup || msg.fromMe || !msg.body) return;

      const assistantId = await db.getBotConfig(botId, "assistantId");
      if (!assistantId) return;

      const existingChat = await prisma.chat.findFirst({
        where: {
          from: msg.from,
          bots: {some: {id: botId}},
        },
        include: {messages: {orderBy: {createdAt: "asc"}, take: 20}},
      });

      let threadId: string;
      if (existingChat) {
        threadId = existingChat.threadId;
      } else {
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
      }

      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: msg.body,
      });

      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      let runStatus;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      } while (runStatus.status !== "completed");

      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find((m) => m.role === "assistant")
        ?.content[0]?.text?.value;

      if (assistantMessage) {
        await msg.reply(assistantMessage);

        await openai.beta.threads.messages.create(threadId, {
          role: "assistant",
          content: assistantMessage,
        });

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
              sender: botId,
              contentSnippet: assistantMessage.slice(0, 300),
              reply: assistantMessage,
              fallback: false,
            },
          ],
        });
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

export {activeClients};
