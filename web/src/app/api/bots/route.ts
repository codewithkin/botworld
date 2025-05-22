import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, prisma } from "@/lib/auth";
import { openai } from "@/lib/ai/openai";
import OpenAI from "openai";
import redis from "@/lib/redis"; // Add Redis import
import { Prisma } from "@/generated/prisma";

export async function POST(request: Request) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate input
    const body = await request.json();
    const { name, purpose, phoneNumber, whatsappNumber, telegramUsername } =
      body;

    if (!name || !purpose) {
      return new NextResponse(
        JSON.stringify({ error: "Name and purpose are required" }),
        {
          status: 400,
        },
      );
    }

    // Create OpenAI Assistant with fixed model
    const assistant = await openai.beta.assistants.create({
      name: `${name} Assistant`,
      instructions: `Your name is ${name}. You are ${purpose}. You will receive some chat and user data and you must answer the user's question with relevant and correct data`,
      model: "o3-mini",
    });

    // Create bot in database
    const newBot = await prisma.bot.create({
      data: {
        name,
        purpose,
        phoneNumber,
        whatsapp_number: whatsappNumber,
        telegram_username: telegramUsername,
        assistantId: assistant.id,
        user: { connect: { id: session.user.id } },
      },
    });

    // Store assistant ID in Redis with expiration (1 week)
    await redis.set(`bot:${newBot.id}:assistantId`, assistant.id, "EX", 604800);

    return new NextResponse(JSON.stringify(newBot), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[BOTS_POST]", error);

    if (error instanceof OpenAI.APIError) {
      return new NextResponse(
        JSON.stringify({
          error: "AI Service Error",
          message: error.message,
          code: error.code,
        }),
        { status: 500 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return new NextResponse(
          JSON.stringify({ error: "Bot with this name already exists" }),
          {
            status: 409,
          },
        );
      }
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
