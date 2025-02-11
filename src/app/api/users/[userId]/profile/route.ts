import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.id !== params.userId) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await request.json()

    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        fullName: body.fullName,
        fbLink: body.fbLink,
        linkedinLink: body.linkedinLink,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        fbLink: true,
        linkedinLink: true,
        gender: true,
        dateOfBirth: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[USER_PROFILE_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
