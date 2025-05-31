import { Request, Response } from "express";
import { prisma } from "../../lib/auth";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export default async function getAllBots(req: Request, res: Response) {
    try {
        // Get the user's id from the session
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        const userId = session?.user.id;
        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized: No user ID found in session",
            });
        }
        console.log("User ID from session:", userId);

        // Find all bots that belong to the user
        const bots = await prisma.bot.findMany({
            where: {
                userId: userId,
            },
        });

        if (!bots) {
            return res.status(404).json({
                error: "No bots found for this user",
            });
        }

        return res.json(bots);
    } catch (e) {
        console.error("An error occurred while getting all bots: ", e);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}
