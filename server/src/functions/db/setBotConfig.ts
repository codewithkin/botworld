import { prisma } from "../../lib/auth";

export async function setBotConfig(
  botId: string,
  property: string,
  value: any
) {
  try {
    // Update the bot using prisma
    await prisma.bot.update({
      where: {
        id: botId,
      },
      data: {
        [property]: value,
      },
    });
  } catch (e) {
    console.log(
      "Failed to set property " + property + " on bot with id " + botId
    );
  }
}