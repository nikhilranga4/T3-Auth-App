import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const userDetailsSchema = z.object({
  name: z.string().min(1),
  image: z.string().url().optional().nullable(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = userDetailsSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ message: result.error.errors[0]?.message ?? "Invalid data" }),
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: result.data,
      select: {
        name: true,
        image: true,
      },
    });

    return new NextResponse(
      JSON.stringify(updatedUser),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user details:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        image: true,
      },
    });

    return new NextResponse(
      JSON.stringify(user),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
} 