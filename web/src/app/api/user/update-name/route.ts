import { auth, prisma } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ message: 'Invalid name provided' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { name },
        });

        return NextResponse.json({ message: 'Name updated successfully', user: updatedUser });
    } catch (error) {
        console.error('[UPDATE_NAME_ERROR]', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}
