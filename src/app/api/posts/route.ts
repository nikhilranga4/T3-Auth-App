import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const postSchema = z.object({
  name: z.string().min(1, "Title is required"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name } = postSchema.parse(body);

    const post = await db.post.create({
      data: {
        name,
        createdById: session.user.id,
      },
    });

    return new NextResponse(
      JSON.stringify(post),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ message: error.errors[0]?.message || "Invalid data" }),
        { status: 400 }
      );
    }

    console.error("Error creating post:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const posts = await db.post.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return new NextResponse(
      JSON.stringify(posts),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
} 