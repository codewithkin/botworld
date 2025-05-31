import { Request, Response } from "express";
import { prisma } from "../../lib/auth";
import { OpenAI } from "openai";

const openai = new OpenAI();

export default async function updateBot(req: Request, res: Response) {
    try {
        // Get the bot's id from query params
        const id = req.query.id as string;

        if (!id) {
            console.log("No bot id passed to query params");
            return res.status(400).json({
                error: "No bot id passed to query params"
            });
        }

        // Get the updated data from the request body
        const { name, purpose } = req.body;

        // Check if the bot exists and retrieve assistantId
        const bot = await prisma.bot.findUnique({
            where: { id },
            select: { assistantId: true }
        });

        if (!bot) {
            return res.status(404).json({ error: "Bot not found" });
        }

        // If assistantId exists, update the assistant in OpenAI
        if (bot.assistantId) {
            try {
                await openai.beta.assistants.update(bot.assistantId, {
                    name,
                    instructions: purpose
                });
            } catch (err) {
                console.log("Failed to update OpenAI assistant: " + err);
                // Optionally, you can return an error here or continue
            }
        }

        // Update the bot that matches the query
        const updatedBot = await prisma.bot.update({
            where: { id },
            data: { name, purpose }
        });

        return res.json(updatedBot);
    } catch (e) {
        console.log("An error occurred while updating bot: " + e);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}