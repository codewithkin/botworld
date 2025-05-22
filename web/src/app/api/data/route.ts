import { auth, prisma } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get the user's session data
    const data = await auth.api.getSession({
      headers: await headers(),
    });

    const user = data?.user;

    // Get the user's full data (bots, documents etc)
    const fullUser = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },
      include: {
        bots: true,
        documents: true,
        messages: true,
      },
    });

    // Return the user's full data
    return NextResponse.json({
      data: {
        bots: fullUser?.bots,
        documents: fullUser?.documents,
        messages: fullUser?.messages,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
