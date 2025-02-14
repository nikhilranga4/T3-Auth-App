import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendWelcomeEmail } from "~/server/nodemailer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/?error=missing-token", request.url)
      );
    }

    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/?error=invalid-token", request.url)
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    // Send welcome email after successful verification
    await sendWelcomeEmail({
      email: user.email,
      name: user.name
    });

    return NextResponse.redirect(
      new URL("/signin?verified=true", request.url)
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.redirect(
      new URL("/?error=verification-failed", request.url)
    );
  }
} 