import { Request, Response } from 'express';
import { auth, prisma } from '../../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

export async function getUserData(req: Request, res: Response) {
  try {
    // Get the user's session data
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      console.log("Session data:", session);

    const user = session?.user;

    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the user's full data (bots, documents etc)
    const fullUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        bots: true,
        documents: true,
        messages: true,
      },
    });

    if (!fullUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's full data
    return res.json({
      data: {
        bots: fullUser.bots,
        documents: fullUser.documents,
        messages: fullUser.messages,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}