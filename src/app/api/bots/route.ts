// app/api/bots/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Prisma } from '../../../../prisma/generated/prisma';
import { auth } from '@/lib/auth';
import { prisma } from '@/prisma';

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await request.json();
    const { name, purpose, phoneNumber, whatsappNumber, telegramUsername } = body;

    console.log('Data from frontend: ', body);

    // Validate required fields
    if (!name || !purpose) {
      console.log('Name and purpose are required');
      return new NextResponse(JSON.stringify({ error: 'Name and purpose are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create bot with connected user
    const newBot = await prisma.bot.create({
      data: {
        name,
        purpose,
        phoneNumber, // Assuming this is the main contact number
        whatsapp_number: whatsappNumber,
        telegram_username: telegramUsername,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return new NextResponse(JSON.stringify(newBot), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[BOTS_POST]', error);

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NextResponse(JSON.stringify({ error: 'Bot with this name already exists' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
