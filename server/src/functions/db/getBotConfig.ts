import {prisma} from "../../lib/auth";

export default async function getBotConfig(botId: string, property: string) {
  try {
    // Get the bot using prisma
    const bot: any = await prisma.bot.findUnique({
      where: {
        id: botId,
      },
    });

    // Get the specific property from the bot
    return bot[property];
  } catch (e) {
    console.log(
      "Failed to get property " + property + " on bot with id " + botId
    );
  }
}