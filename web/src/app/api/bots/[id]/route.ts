import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // No need to await params
    
    // First delete related documents and messages
    await prisma.document.deleteMany({
      where: { botId: id }
    });

    await prisma.message.deleteMany({
      where: { botId: id }
    });

    // Then delete the bot
    const deletedBot = await prisma.bot.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, bot: deletedBot });
  } catch (error) {
    console.error("[BOT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}