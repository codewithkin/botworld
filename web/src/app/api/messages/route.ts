import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { Prisma } from "@/generated/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.botId || !data.userId || !data.sender || !data.contentSnippet) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        },
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        botId: data.botId,
        userId: data.userId,
        sender: data.sender,
        contentSnippet: data.contentSnippet,
        reply: data.reply,
        fallback: data.fallback || false,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
