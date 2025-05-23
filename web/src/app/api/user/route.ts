import { auth, prisma } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get the user's session data
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Get the user's full data (bots, documents etc)
    const fullUser = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
      include: {
        bots: true,
      },
    });

    // Return the user's full data
    return NextResponse.json(fullUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
