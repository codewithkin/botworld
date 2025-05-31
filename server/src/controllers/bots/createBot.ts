import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { OpenAI } from "openai";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { plans } from "../../lib/plans";

const prisma = new PrismaClient();
const openai = new OpenAI();

export const createBot = async (req: Request, res: Response) => {
    try {
        // Authentication
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get user plan
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { plan: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check bot count for plan
        const botCount = await prisma.bot.count({
            where: { userId: session.user.id },
        });

        const planKey = user.plan as keyof typeof plans;
        if (botCount >= plans[planKey].bots) {
            return res.status(403).json({
                error: `You have reached the limit of ${plans[planKey].bots} bots for your plan. Please upgrade your plan to create more bots.`,
            });
        }

        // Parse and validate input
        const { name, purpose, phoneNumber, whatsappNumber, telegramUsername } = req.body as {
            name?: string;
            purpose?: string;
            phoneNumber?: string;
            whatsappNumber?: string;
            telegramUsername?: string;
        };

        if (!name || !purpose) {
            return res.status(400).json({ error: "Name and purpose are required" });
        }

        // Create OpenAI Assistant
        const assistant = await openai.beta.assistants.create({
            name: `${name} Assistant`,
            instructions: `
You are ${name}, a friendly and helpful AI assistant with specialized knowledge about: ${purpose}.

# Primary Mode:
- Engage naturally in conversation like a helpful human assistant
- Answer general knowledge questions when asked
- Be polite, warm, and personable in all interactions

# Specialized Mode (when relevant):
- When questions relate to ${purpose}, provide expert-level responses
- Use your specialized knowledge to give accurate, detailed answers
- Offer additional helpful information within your domain

# Boundaries:
- Only refuse questions if they are:
    * Clearly outside both general knowledge and your specialty
    * Harmful, illegal, or violate ethical guidelines
    * Require personal data you don't have access to

# Response Guidelines:
- For general questions: Answer normally and conversationally
- For ${purpose} questions: Provide detailed, expert responses
- For unrelated specialized questions: "I can help with general questions or ${purpose}. For specialized help outside this, you might want to contact ${phoneNumber}."
- For unclear questions: Ask clarifying questions
- Tone: Adapt naturally between:
    * Friendly (default)
    * Professional (when discussing ${purpose})
    * Empathetic (for sensitive topics)
    * Firm (only for policy violations)

# Important Notes:
- You're both a general conversationalist and a specialist
- Default to being helpful whenever possible
- Only redirect to ${phoneNumber} when completely unable to help
- Never claim abilities you don't have
- Admit when you don't know something`,
            description: `AI assistant specializing in ${purpose} but capable of general conversation`,
            model: "gpt-4-turbo",
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

        return res.status(201).json(newBot);
    } catch (error: any) {
        console.error("[BOTS_POST]", error);

        if (error instanceof OpenAI.APIError) {
            return res.status(500).json({
                error: "AI Service Error",
                message: error.message,
                code: error.code,
            });
        }

        if (
            error instanceof prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(409).json({ error: "Bot with this name already exists" });
        }

        return res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await prisma.$disconnect();
    }
};
