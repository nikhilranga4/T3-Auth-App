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

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        fbLink: true,
        linkedinLink: true,
        gender: true,
        dateOfBirth: true,
        image: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const { fullName, fbLink, linkedinLink, gender, dateOfBirth, image } = data;

    // Validate required fields
    if (!fullName) {
      return new NextResponse("Full name is required", { status: 400 });
    }

    // Update user details in database
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName,
        fbLink,
        linkedinLink,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        image: image || undefined, // Store base64 image string directly
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user details:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 