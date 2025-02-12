import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { DefaultSession, User } from "next-auth";
import { db } from "~/server/db";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

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
				if (!credentials || !credentials.email || !credentials.password) {
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
					throw new Error("User not found");
				}

				if (!user.password) {
					throw new Error("Please sign in with your social account");
				}

				if (!user.isVerified) {
					throw new Error("Please verify your email before signing in");
				}

				const isPasswordValid = await compare(password, user.password);

				if (!isPasswordValid) {
					throw new Error("Invalid credentials");
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
			if (session.user) {
				session.user.id = token.id as string;
				session.user.image = token.image as string | null;
			}
			return session;
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