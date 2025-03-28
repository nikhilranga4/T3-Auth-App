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
			isVerified?: boolean;
		} & DefaultSession["user"];
	}
}

interface AuthUser extends User {
	isVerified?: boolean;
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
			profile(profile) {
				return {
					id: profile.id.toString(),
					name: profile.name || profile.login,
					email: profile.email,
					image: profile.avatar_url,
					isVerified: true,
				} as AuthUser;
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
			authorization: {
				params: {
					prompt: "select_account",
					access_type: "offline",
					response_type: "code",
				},
			},
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					isVerified: true,
				} as AuthUser;
			},
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials): Promise<AuthUser | null> {
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
					isVerified: user.isVerified,
				};
			}
		})
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			try {
				if (account?.provider === "google" || account?.provider === "github") {
					const existingUser = await db.user.findUnique({
						where: { email: user.email! },
						select: {
							id: true,
							image: true,
							emailVerified: true,
							isVerified: true,
						},
					});

					if (existingUser) {
						// Update user data
						await db.user.update({
							where: { id: existingUser.id },
							data: {
								emailVerified: existingUser.emailVerified ?? new Date(),
								isVerified: true,
								image: profile?.picture || profile?.avatar_url || user.image,
							},
						});
					} else {
						// Create new user
						await db.user.create({
							data: {
								email: user.email!,
								name: user.name,
								image: profile?.picture || profile?.avatar_url,
								emailVerified: new Date(),
								isVerified: true,
							},
						});
					}
				}
				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false;
			}
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.isVerified = (user as AuthUser).isVerified;
				if (user.image?.includes('res.cloudinary.com')) {
					token.picture = user.image;
				}
			}
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.isVerified = token.isVerified as boolean;
				if (token.picture) {
					session.user.image = token.picture as string;
				}
			}
			return session;
		},
		async redirect({ url, baseUrl }) {
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
	},
	pages: {
		signIn: "/signin",
		error: "/signin",
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	debug: process.env.NODE_ENV === "development",
});