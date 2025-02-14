import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendWelcomeEmail } from "~/server/nodemailer";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/signin?error=missing-token", process.env.NEXTAUTH_URL!));
    }

    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/signin?error=invalid-token", process.env.NEXTAUTH_URL!));
    }

    if (!user.email) {
      return NextResponse.redirect(new URL("/signin?error=invalid-email", process.env.NEXTAUTH_URL!));
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        isVerified: true,
      },
    });

    // Send welcome email after successful verification
    await sendWelcomeEmail({
      email: user.email,
      name: user.name ?? user.email.split("@")[0]
    });

    // Redirect to sign-in page with success message
    return NextResponse.redirect(new URL("/signin?verified=true", process.env.NEXTAUTH_URL!));
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.redirect(new URL("/signin?error=verification-failed", process.env.NEXTAUTH_URL!));
  }
} 