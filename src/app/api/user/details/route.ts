import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const userDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  fbLink: z.string().url().optional().nullable(),
  linkedinLink: z.string().url().optional().nullable(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  image: z.string().optional().nullable(),
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
    const validatedData = userDetailsSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        fullName: validatedData.fullName,
        fbLink: validatedData.fbLink,
        linkedinLink: validatedData.linkedinLink,
        gender: validatedData.gender,
        dateOfBirth: validatedData.dateOfBirth,
        image: validatedData.image,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "User details updated successfully",
        user: {
          ...updatedUser,
          dateOfBirth: updatedUser.dateOfBirth?.toISOString(),
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid data",
          errors: error.errors,
        }),
        { status: 400 }
      );
    }

    console.error("Error updating user details:", error);
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
      JSON.stringify({
        ...user,
        dateOfBirth: user?.dateOfBirth?.toISOString(),
      }),
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