import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";

const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const result = signUpSchema.safeParse(body);

		if (!result.success) {
			return new NextResponse(
				JSON.stringify({ message: result.error.errors[0]?.message ?? "Invalid data" }),
				{ status: 400 }
			);
		}

		const { email, password, name } = result.data;

		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return new NextResponse(
				JSON.stringify({ message: "User already exists" }),
				{ status: 409 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await db.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
			},
		});

		return new NextResponse(
			JSON.stringify({ 
				message: "User created successfully",
				userId: user.id 
			}),
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error during sign up:", error);
		return new NextResponse(
			JSON.stringify({ message: "Internal server error" }),
			{ status: 500 }
		);
	}
}