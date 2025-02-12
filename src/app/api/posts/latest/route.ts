import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const post = await db.post.findFirst({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return new NextResponse(
      JSON.stringify(post),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching latest post:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
} 