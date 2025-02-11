import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Authorize called with credentials:', credentials ? 'Credentials provided' : 'No credentials')
        
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing email or password')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.error('No user found with email:', credentials.email)
            return null
          }

          const isPasswordValid = await compare(
            credentials.password, 
            user.password || ''
          )

          if (!isPasswordValid) {
            console.error('Invalid password for user:', credentials.email)
            return null
          }

          console.log('User authenticated successfully:', user.email)
          return { 
            id: user.id.toString(), 
            email: user.email, 
            name: user.name 
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      profile(profile) {
        console.log('GitHub profile:', profile)
        return {
          id: profile.id.toString(),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account"
        }
      },
      profile(profile) {
        console.log('Google profile:', profile)
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signup",
    error: "/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - Token:', token, 'User:', user)
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - Session:', session, 'Token:', token)
      session.user.id = token.id as string
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - URL:', url, 'Base URL:', baseUrl)
      // Always redirect to dashboard after successful login
      if (url === baseUrl || url.startsWith('/signup') || url.startsWith('/login')) {
        return `${baseUrl}/dashboard`
      }
      
      // Ensure redirects stay within the same domain
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  events: {
    async signIn(message) {
      console.log('Sign in event', message)
    },
    async signOut(message) {
      console.log('Sign out event', message)
    },
    async createUser(message) {
      console.log('User created', message)
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
