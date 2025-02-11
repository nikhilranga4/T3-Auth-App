"use client"

import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LoginForm } from '../../components/LoginForm'
import { useEffect } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      redirect('/dashboard')
    }
  }, [status])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  )
}
