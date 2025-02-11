import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check email'
    console.error('Check email error:', errorMessage)
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (user) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check email'
    console.error('Check email error:', errorMessage)
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
