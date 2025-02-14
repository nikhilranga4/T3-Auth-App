import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { DefaultSession, User } from "next-auth";
import { db } from "~/server/db";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { sendWelcomeEmail } from "~/server/nodemailer";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			image?: string | null;
		} & DefaultSession["user"];
	}
}

interface Credentials {
	email: string;
	password: string;
}

export const { auth, handlers } = NextAuth({
	adapter: PrismaAdapter(db),
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID ?? "",
			clientSecret: process.env.GITHUB_SECRET ?? "",
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials): Promise<User | null> {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password required");
				}

				const { email, password } = credentials as Credentials;

				const user = await db.user.findUnique({
					where: { email },
					select: {
						id: true,
						email: true,
						name: true,
						password: true,
						image: true,
						isVerified: true,
					}
				});

				if (!user) {
					throw new Error("Email does not exist");
				}

				if (!user.password) {
					throw new Error("Please sign in with your social account");
				}

				if (!user.isVerified) {
					throw new Error("Please verify your email before signing in");
				}

				const isPasswordValid = await compare(password, user.password);

				if (!isPasswordValid) {
					throw new Error("Incorrect password");
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
				};
			}
		})
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.image = user.image;
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user) {
				session.user.id = token.id as string;
				session.user.image = token.image as string | null;
			}
			return session;
		},
		async signIn({ user, account, profile }) {
			try {
				if (!user.email) {
					console.error("No email provided by social login");
					return false;
				}

				if (account?.provider === "google" || account?.provider === "github") {
					const existingUser = await db.user.findUnique({
						where: { email: user.email },
						select: {
							id: true,
							image: true,
							emailVerified: true,
							isVerified: true,
						}
					});

					const now = new Date();

					if (existingUser) {
						// Update existing user
						const shouldUpdateImage = !existingUser.image?.includes('res.cloudinary.com');
						
						await db.user.update({
							where: { id: existingUser.id },
							data: {
								emailVerified: now,
								isVerified: true,
								image: shouldUpdateImage ? user.image : existingUser.image,
							},
						});

						// Send welcome email only if this is the first time the user is verified
						if (!existingUser.isVerified) {
							console.log('Sending welcome email to existing user:', user.email);
							await sendWelcomeEmail(
								{
									email: user.email,
									name: user.name
								},
								true,
								account.provider
							);
						}
					} else {
						// Create new user
						const newUser = await db.user.create({
							data: {
								email: user.email,
								name: user.name,
								image: user.image,
								emailVerified: now,
								isVerified: true,
							},
						});

						console.log('Sending welcome email to new user:', user.email);
						// Send welcome email for new user
						await sendWelcomeEmail(
							{
								email: user.email,
								name: user.name
							},
							true,
							account.provider
						);
					}
				}
				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false; // Return false on error to prevent sign in
			}
		},
	},
	events: {
		async createUser({ user }) {
			if (user.email) {
				console.log('Sending welcome email from createUser event:', user.email);
				await sendWelcomeEmail(
					{
						email: user.email,
						name: user.name ?? user.email.split('@')[0]
					},
					false
				);
			}
		},
	},
	pages: {
		signIn: "/signin",
		error: "/signin",
	},
	session: {
		strategy: "jwt",
	},
});