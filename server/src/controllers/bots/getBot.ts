import { Request, Response } from "express";
import { prisma } from "../../lib/auth";

export default async function getBot (req: Request, res: Response) {
    try {
        // Get the bot's id from query params
        const id = req.query.id as string;

        if(!id) {
            console.log("No bot id passed to query params");

            return res.json({
                error: "No bot id passed to query params"
            }).status(400);
        }

        // Find a bot that matches the query
        const bot = await prisma.bot.findUnique({
            where: {
                id
            }
        })

        if(!bot) {
            return res.json({
                error: "No such bot exists"
            }).status(404);
        }

        return res.json(bot);
    } catch (e) {
        console.log("An error occured while getting bot data: " + e);
    }
}