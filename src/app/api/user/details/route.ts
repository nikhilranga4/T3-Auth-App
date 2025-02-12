import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const userDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  fbLink: z.string().url().optional().nullable(),
  linkedinLink: z.string().url().optional().nullable(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

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
        fullName: true,
        fbLink: true,
        linkedinLink: true,
        gender: true,
        dateOfBirth: true,
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
    const result = userDetailsSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          message: "Invalid data", 
          errors: result.error.errors 
        }),
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...result.data,
        dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : null,
      },
      select: {
        fullName: true,
        fbLink: true,
        linkedinLink: true,
        gender: true,
        dateOfBirth: true,
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