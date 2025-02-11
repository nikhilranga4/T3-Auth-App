import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  let prismaClient = prisma;
  
  // Ensure we have a fresh connection
  try {
    await prismaClient.$connect();
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { message: 'Database connection failed' },
      { status: 500 }
    );
  }
  try {
    const body = await req.json().catch(() => ({}))
    const { email, password, name } = body

    // Quick validation
    if (!email || !password || !name) {
      return NextResponse.json({ 
        message: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          name: !name ? 'Name is required' : null
        }
      }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ 
        message: 'Invalid email format',
        field: 'email'
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        message: 'Password must be at least 8 characters',
        field: 'password'
      }, { status: 400 })
    }

    // Check if email exists first
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: 'Email already registered',
        field: 'email'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    try {
      // Create user with unique constraint
      const user = await prismaClient.user.create({
        data: { 
          email, 
          name, 
          password: hashedPassword 
        },
        select: { 
          id: true, 
          email: true, 
          name: true 
        }
      })

      return NextResponse.json(
        { 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name 
          } 
        },
        { status: 201 }
      )

    } catch (error) {
      // Handle unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json({ 
            message: 'Email already registered',
            field: 'email'
          }, { status: 400 })
        }
      }
      throw error // Re-throw other errors
    }

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle different types of errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { message: 'Email already registered', field: 'email' },
          { status: 400 }
        )
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json(
      { 
        message: 'Registration failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  } finally {
    try {
      await prismaClient.$disconnect()
    } catch (e) {
      console.error('Error disconnecting from database:', e)
    }
  }
}
