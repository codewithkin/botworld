import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, prisma } from "@/lib/auth";
import { openai } from "@/lib/ai/openai";
import OpenAI from "openai";
import { Prisma } from "@/generated/prisma";
import { plans } from "@/lib/plans";

export async function POST(request: Request) {

  // Get the user's session
  const session = await auth.api.getSession({ headers: await headers() });

  // Check what the user's plan is
  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
    select: {
      plan: true,
    },
  });

  // If the user is on the free plan, check if they have reached the limit of 1 bot
  const botCount = await prisma.bot.count({
    where: {
      userId: session?.user?.id,
    },
  });

  if (botCount >= plans[user?.plan as keyof typeof plans].bots) {
    return new NextResponse(
      JSON.stringify({
        error: `You have reached the limit of ${plans[user?.plan as keyof typeof plans].bots} bots for your plan. Please upgrade your plan to create more bots.`,
      }),
      {
        status: 403
      }
    )
  }

  // CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": process.env
      .NEXT_PUBLIC_WHATSAPP_SERVER_URL as string,
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders },
        },
      );
    }

  // Create OpenAI Assistant with fixed model
  const assistant = await openai.beta.assistants.create({
    name: `${name} Assistant`,
    instructions: `
  You are ${name}, a friendly and helpful AI assistant with specialized knowledge about: ${purpose}.
  
  # Primary Mode:
  - Engage naturally in conversation like a helpful human assistant
  - Answer general knowledge questions when asked
  - Be polite, warm, and personable in all interactions
  
  # Specialized Mode (when relevant):
  - When questions relate to ${purpose}, provide expert-level responses
  - Use your specialized knowledge to give accurate, detailed answers
  - Offer additional helpful information within your domain
  
  # Boundaries:
  - Only refuse questions if they are:
    * Clearly outside both general knowledge and your specialty
    * Harmful, illegal, or violate ethical guidelines
    * Require personal data you don't have access to
  
  # Response Guidelines:
  - For general questions: Answer normally and conversationally
  - For ${purpose} questions: Provide detailed, expert responses
  - For unrelated specialized questions: "I can help with general questions or ${purpose}. For specialized help outside this, you might want to contact ${phoneNumber}."
  - For unclear questions: Ask clarifying questions
  - Tone: Adapt naturally between:
    * Friendly (default)
    * Professional (when discussing ${purpose})
    * Empathetic (for sensitive topics)
    * Firm (only for policy violations)
  
  # Important Notes:
  - You're both a general conversationalist and a specialist
  - Default to being helpful whenever possible
  - Only redirect to ${phoneNumber} when completely unable to help
  - Never claim abilities you don't have
  - Admit when you don't know something`,
    description: `AI assistant specializing in ${purpose} but capable of general conversation`,
    model: "gpt-4-turbo",
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

    return new NextResponse(JSON.stringify(newBot), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        { status: 500, headers: { ...corsHeaders } },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return new NextResponse(
          JSON.stringify({ error: "Bot with this name already exists" }),
          {
            status: 409,
            headers: { ...corsHeaders },
          },
        );
      }
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { ...corsHeaders },
      },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET (request: NextRequest) {
  try {
    // Get the user's session info
    const data = await auth.api.getSession({
      headers: await headers()
    })

    // Get the user's id
    const id = data?.user.id;

    // Get the bots created by the user
    const bots = await prisma.bot.findMany({
      where: {
        userId: id
      },
      include: {
        messages: true,
        documents: true
      }
    })

    return NextResponse.json({bots})
  } catch (e) {
    console.log("An error occured while getting all bots: ", e);

    return NextResponse.json({
      message: "An error occured while getting all bots"
    }, {status: 400})
  }
}