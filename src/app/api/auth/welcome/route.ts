import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { sendWelcomeEmail } from "~/server/nodemailer";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { provider } = await req.json();
    
    if (!session.user.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const success = await sendWelcomeEmail(
      {
        email: session.user.email,
        name: session.user.name
      },
      true,
      provider
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Welcome email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in welcome email route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 