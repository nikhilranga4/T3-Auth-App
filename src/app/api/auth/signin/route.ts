import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const result = signInSchema.safeParse(body);

		if (!result.success) {
			return new NextResponse(
				JSON.stringify({ message: result.error.errors[0]?.message ?? "Invalid data" }),
				{ status: 400 }
			);
		}

		const { email, password } = result.data;

		const user = await db.user.findUnique({
			where: { email },
		});

		if (!user?.password) {
			return new NextResponse(
				JSON.stringify({ message: "Invalid credentials" }),
				{ status: 401 }
			);
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			return new NextResponse(
				JSON.stringify({ message: "Invalid credentials" }),
				{ status: 401 }
			);
		}

		return new NextResponse(
			JSON.stringify({ message: "Sign in successful" }),
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error during sign in:", error);
		return new NextResponse(
			JSON.stringify({ message: "Internal server error" }),
			{ status: 500 }
		);
	}
}