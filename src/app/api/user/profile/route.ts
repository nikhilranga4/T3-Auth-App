import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { userId, fullName, fbLink, linkedinLink, gender, dateOfBirth } = body

    if (session.user.id !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        fbLink,
        linkedinLink,
        gender,
        dateOfBirth,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
