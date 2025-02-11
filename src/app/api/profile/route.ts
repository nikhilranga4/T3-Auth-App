import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, fullName, fbLink, linkedinLink, gender, dateOfBirth } = body

    if (!userId || !fullName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Validate date format
    let parsedDate: Date | null = null
    if (dateOfBirth) {
      try {
        parsedDate = new Date(dateOfBirth)
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date')
        }
      } catch (e) {
        return NextResponse.json(
          { message: 'Invalid date format' },
          { status: 400 }
        )
      }
    }

    // Prepare the data object with only defined values
    const updateData: any = {
      fullName,
    }

    if (fbLink !== undefined) updateData.fbLink = fbLink
    if (linkedinLink !== undefined) updateData.linkedinLink = linkedinLink
    if (gender !== undefined) updateData.gender = gender
    if (parsedDate !== null) updateData.dateOfBirth = parsedDate

    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: updateData,
      })

      return NextResponse.json(updatedUser)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }
      throw error // Re-throw for general error handling
    }
  } catch (error: any) {
    console.error('Profile update error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })

    return NextResponse.json(
      { message: error.message || 'An error occurred while updating the profile' },
      { status: 500 }
    )
  }
}
