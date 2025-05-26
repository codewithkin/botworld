import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { Prisma } from "@/generated/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Validate parameters
    if (isNaN(pageSize)) {
      return NextResponse.json(
        { error: 'Invalid pageSize parameter' },
        { status: 400 }
      );
    }

    if (isNaN(page)) {
      return NextResponse.json(
        { error: 'Invalid page parameter' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * pageSize;

    // Get messages with related bot data
    const messages = await prisma.message.findMany({
      take: pageSize,
      skip,
      orderBy: {
        [orderBy]: order
      },
      include: {
        bot: {
          select: {
            name: true,
            purpose: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.message.count();

    return NextResponse.json({
      data: messages,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page * pageSize < totalCount,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


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


// Helper function for week number calculation (used in client component)
function getWeekNumber(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getFirstDayOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}