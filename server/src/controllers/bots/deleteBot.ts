import { prisma } from "../../lib/auth";
import { Request, Response } from "express";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function deleteBot(req: Request, res: Response) {
    try {
        // Get the bot's id from query params
        const id = req.query.id as string;

        if (!id) {
            console.log("No bot id passed to query params");
            return res.status(400).json({
                error: "No bot id passed to query params"
            });
        }

        // Find the bot first to get assistantId
        const bot = await prisma.bot.findUnique({
            where: { id }
        });

        if (!bot) {
            return res.status(404).json({ error: "Bot not found" });
        }

        const assistantId = bot.assistantId;

        // Delete the bot from the database
        const deletedBot = await prisma.bot.delete({
            where: { id }
        });

        // Delete the assistant from OpenAI if assistantId exists
        if (assistantId) {
            try {
                await openai.beta.assistants.del(assistantId);
            } catch (err) {
                console.log("Failed to delete OpenAI assistant:", err);
                // Optionally, you can return an error or just log it
            }
        }

        return res.json(deletedBot);
    } catch (e) {
        console.log("An error occurred while deleting bot: " + e);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
