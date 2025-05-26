import { prisma } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {id: userId} = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            bots: true,
            documents: true,
            messages: true
          }
        },
        bots: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        },
        messages: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            bot: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}