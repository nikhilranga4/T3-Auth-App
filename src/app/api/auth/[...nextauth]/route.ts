import NextAuth from 'next-auth'
import { compare } from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { NextAuthOptions } from 'next-auth'

const prisma = new PrismaClient()

const isDevelopment = process.env.NODE_ENV === 'development'

const authSecret = process.env.NEXTAUTH_SECRET || (
  isDevelopment 
    ? 'development-secret-key-change-me-in-production' 
    : undefined
)

if (!authSecret) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET')
}

export function getAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    secret: authSecret,
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
      signIn: '/login',
      signOut: '/login',
      error: '/login',
    },
    cookies: {
      sessionToken: {
        name: isDevelopment ? 'next-auth.session-token' : '__Secure-next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: !isDevelopment
        }
      },
      callbackUrl: {
        name: isDevelopment ? 'next-auth.callback-url' : '__Secure-next-auth.callback-url',
        options: {
          sameSite: 'lax',
          path: '/',
          secure: !isDevelopment
        }
      },
      csrfToken: {
        name: isDevelopment ? 'next-auth.csrf-token' : '__Host-next-auth.csrf-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: !isDevelopment
        }
      },
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        authorization: {
          params: {
            prompt: "select_account"
          }
        },
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          }
        },
      }),
      GitHubProvider({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
        profile(profile) {
          return {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            email: profile.email,
            image: profile.avatar_url,
          }
        },
      }),
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Invalid credentials')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: { id: true, email: true, name: true, password: true }
          })

          if (!user || !user.password) {
            throw new Error('Invalid email or password')
          }

          const isValid = await compare(credentials.password, user.password)
          
          if (!isValid) {
            throw new Error('Invalid email or password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      })
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        if (account?.provider === "github") {
          return true
        }
        return true
      },
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
        }
        return token
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.email = token.email
          session.user.name = token.name
        }
        return session
      },
      async redirect({ url, baseUrl }) {
        // Always redirect to dashboard after sign in
        if (url.startsWith('/login') || url.startsWith('/signup') || url === '/') {
          return '/dashboard'
        }
        // Handle absolute URLs
        if (url.startsWith('http')) {
          const urlObj = new URL(url)
          if (urlObj.origin === baseUrl) {
            return url
          }
          return baseUrl
        }
        // Handle relative URLs
        return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`
      }
    },
    events: {
      async signIn({ user, account, profile }) {
        console.log("User signed in:", user)
      },
      async createUser({ user }) {
        console.log("User created:", user)
      }
    },
    debug: false,
  }
}

const handler = NextAuth(getAuthOptions())

export { handler as GET, handler as POST }
