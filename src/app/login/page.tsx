"use client"

import { redirect } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { LoginForm } from '../../components/LoginForm'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const session = await getSession()
      
      if (session) {
        redirect('/dashboard')
      }
      
      setIsLoading(false)
    }

    checkSession()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  )
}
