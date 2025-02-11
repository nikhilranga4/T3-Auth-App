import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { UserProfile } from '@/components/UserProfile'
import { SignOutButton } from '@/components/SignOutButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
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

  if (!user) {
    redirect('/login')
  }

  const isProfileComplete = user.fullName && user.gender && user.dateOfBirth

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, <span className="font-semibold text-indigo-600">{user.fullName || user.email}</span>
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Status */}
        {!isProfileComplete && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-800 font-medium">Please complete your profile to access all features</p>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <UserProfile
            userId={user.id}
            initialData={{
              fullName: user.fullName || undefined,
              fbLink: user.fbLink || undefined,
              linkedinLink: user.linkedinLink || undefined,
              gender: user.gender as 'male' | 'female' | 'other' | undefined,
              dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
            }}
            onProfileUpdate={async (data) => {
              'use server'
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  fullName: data.fullName,
                  fbLink: data.fbLink,
                  linkedinLink: data.linkedinLink,
                  gender: data.gender,
                  dateOfBirth: data.dateOfBirth,
                },
              })
            }}
          />
        </div>
      </main>
    </div>
  )
}
