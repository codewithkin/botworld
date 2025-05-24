import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id: botId } = await params;
  
      // First delete related documents and messages
      await prisma.document.deleteMany({
        where: { botId }
      });
  
      await prisma.message.deleteMany({
        where: { botId }
      });
  
      // Then delete the bot
      const deletedBot = await prisma.bot.delete({
        where: { id: botId }
      });
  
      return NextResponse.json({ success: true, bot: deletedBot });
    } catch (error) {
      console.error("[BOT_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }