import { auth } from "~/server/auth";
import { compare } from "bcryptjs";
import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return new NextResponse(
				JSON.stringify({ message: "Missing email or password" }),
				{ status: 400 }
			);
		}

		const user = await db.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				password: true,
				isVerified: true,
			},
		});

		if (!user || !user.password) {
			return new NextResponse(
				JSON.stringify({ message: "Invalid credentials" }),
				{ status: 401 }
			);
		}

		if (!user.isVerified) {
			return new NextResponse(
				JSON.stringify({ message: "Please verify your email before signing in" }),
				{ status: 403 }
			);
		}

		const isValid = await compare(password, user.password);

		if (!isValid) {
			return new NextResponse(
				JSON.stringify({ message: "Invalid credentials" }),
				{ status: 401 }
			);
		}

		return new NextResponse(
			JSON.stringify({ message: "Authentication successful" }),
			{ status: 200 }
		);
	} catch (error) {
		console.error("Sign-in error:", error);
		return new NextResponse(
			JSON.stringify({ message: "Internal server error" }),
			{ status: 500 }
		);
	}
}