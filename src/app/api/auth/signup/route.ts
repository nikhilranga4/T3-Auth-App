import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "~/server/db";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "~/lib/resend";

const signupSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, email, password } = signupSchema.parse(body);

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return new NextResponse(
				JSON.stringify({
					message: "Email already exists. Please use a different email or sign in.",
				}),
				{ status: 400 }
			);
		}

		const hashedPassword = await hash(password, 10);
		const verificationToken = uuidv4();

		// Create user with verification token
		const user = await db.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				verificationToken,
			},
		});

		// Send verification email
		try {
			await sendVerificationEmail(email, verificationToken, name);
			return new NextResponse(
				JSON.stringify({
					message: "Email verification is sent to your email. Please check.",
				}),
				{ status: 201 }
			);
		} catch (error) {
			console.error('Error sending verification email:', error);
			
			// Delete the user if email sending fails
			await db.user.delete({
				where: { id: user.id },
			});

			return new NextResponse(
				JSON.stringify({
					message: "Failed to send verification email. Please try again later.",
				}),
				{ status: 500 }
			);
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new NextResponse(
				JSON.stringify({
					message: error.errors[0]?.message || "Invalid data provided",
				}),
				{ status: 400 }
			);
		}

		console.error("Error creating user:", error);
		return new NextResponse(
			JSON.stringify({
				message: "An error occurred during signup. Please try again later.",
			}),
			{ status: 500 }
		);
	}
}