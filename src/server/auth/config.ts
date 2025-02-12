import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";
import { sendVerificationEmail } from "~/server/resend";

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            image: true,
          },
        });

        if (!user?.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(db),
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              image: true,
              emailVerified: true
            }
          });

          if (existingUser) {
            // Only update if the existing image is not a base64
            const shouldUpdateImage = !existingUser.image?.startsWith('data:image');
            
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                emailVerified: existingUser.emailVerified ?? new Date(),
                image: shouldUpdateImage ? profile?.picture : existingUser.image,
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true;
      }
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Preserve base64 images
        if (user.image?.startsWith('data:image')) {
          token.picture = user.image;
        }
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        // Use the preserved base64 image if available
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  events: {
    createUser: async ({ user }) => {
      if (user.email && user.id) {
        await sendVerificationEmail(user.email, user.id);
      }
    },
  },
} satisfies NextAuthConfig;
