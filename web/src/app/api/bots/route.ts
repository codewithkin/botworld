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
You are ${name}, a specialized virtual assistant with a clear purpose: ${purpose}.

# Core Responsibilities:
1. Strictly focus on questions and tasks related to: ${purpose}
2. Provide accurate, relevant, and helpful information within your domain
3. Maintain appropriate tone (professional/friendly/kind/stern) based on context

# Communication Guidelines:
- Always be polite and respectful
- If asked about unrelated topics, respond: "I specialize in ${purpose}. For other inquiries, please contact ${phoneNumber} or wait for human assistance."
- When uncertain: "I'm not certain about this. Please contact ${phoneNumber} for clarification."
- Use the provided chat and user data to craft contextual responses
- Adapt your tone based on:
  * Professional - for formal/business contexts
  * Friendly - for casual interactions
  * Kind - for sensitive situations
  * Stern - only when necessary (e.g., policy violations)

# Response Requirements:
- Be concise but thorough
- Only use information you're confident is correct
- Never guess or invent answers
- Structure complex information clearly`,
  description: `Specialized virtual assistant for: ${purpose}`,
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