import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");

		if (!token) {
			return new NextResponse(
				JSON.stringify({ message: "Missing verification token" }),
				{ status: 400 }
			);
		}

		// Find user with the verification token
		const user = await db.user.findFirst({
			where: { verificationToken: token },
		});

		if (!user) {
			return new NextResponse(
				JSON.stringify({ message: "Invalid verification token" }),
				{ status: 400 }
			);
		}

		// Check if token is already used (user is already verified)
		if (user.isVerified) {
			return new NextResponse(
				JSON.stringify({ message: "Email is already verified" }),
				{ status: 400 }
			);
		}

		// Update user verification status
		await db.user.update({
			where: { id: user.id },
			data: {
				isVerified: true,
				verificationToken: null, // Clear the token after use
				emailVerified: new Date(), // Update emailVerified timestamp
			},
		});

		// Redirect to sign-in page with success message
		return new NextResponse(null, {
			status: 302,
			headers: {
				Location: "/signin?verified=true",
			},
		});
	} catch (error) {
		console.error("Error verifying email:", error);
		return new NextResponse(
			JSON.stringify({ message: "Failed to verify email" }),
			{ status: 500 }
		);
	}
}