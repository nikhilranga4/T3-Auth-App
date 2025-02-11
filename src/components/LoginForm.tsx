'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    try {
      setIsLoading(true)
      setError(null)
      setLoginStatus('validating')

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (!result) {
        throw new Error('An unexpected error occurred')
      }

      if (result.error === 'CredentialsSignin') {
        // Check if email exists in the error message
        if (result.error.includes('email')) {
          setError('No account found with this email address')
        } else {
          setError('Incorrect password. Please try again')
        }
        setLoginStatus('error')
        return
      }

      if (result.error) {
        throw new Error(result.error)
      }

      setLoginStatus('success')
      // Show success state briefly before redirecting
      setTimeout(() => {
        router.push(callbackUrl)
        router.refresh()
      }, 800)

    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.')
      setLoginStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-center min-h-screen">
      <div className="bg-white text-white p-8 rounded-2xl shadow-xl border border-gray-700 relative w-full max-w-md">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl z-10">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-center bg-black bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-black text-center mb-6">Sign in to continue</p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-black mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 bg-gray-290 border ${error?.includes('email') ? 'border-red-500' : 'border-gray-700'} rounded-lg text-black focus:ring-2 focus:ring-gray-500`}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-black mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 bg-white border ${error?.includes('password') ? 'border-red-500' : 'border-gray-700'} rounded-lg text-black focus:ring-2 focus:ring-gray-500`}
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-400">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {loginStatus === 'success' && (
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-400">
              <p className="text-sm text-green-600">Login successful! Redirecting...</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg bg-black text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={async () => {
                  try {
                    setIsGoogleLoading(true)
                    const result = await signIn('google', {
                      callbackUrl: `${window.location.origin}/dashboard`,
                      redirect: false
                    })
                    
                    if (result?.error) {
                      throw new Error(result.error)
                    }
                    
                    if (result?.url) {
                      router.push(result.url)
                    } else {
                      router.push('/dashboard')
                    }
                  } catch (error) {
                    console.error('Google login error:', error)
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "There was a problem signing in with Google",
                      duration: 5000,
                    })
                  } finally {
                    setIsGoogleLoading(false)
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2 space-x-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isGitHubLoading}
                onClick={async () => {
                  try {
                    setIsGitHubLoading(true)
                    const result = await signIn('github', {
                      callbackUrl: `${window.location.origin}/dashboard`,
                      redirect: false
                    })
                    
                    if (result?.error) {
                      throw new Error(result.error)
                    }
                    
                    if (result?.url) {
                      router.push(result.url)
                    } else {
                      router.push('/dashboard')
                    }
                  } catch (error) {
                    console.error('GitHub login error:', error)
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "There was a problem signing in with GitHub",
                      duration: 5000,
                    })
                  } finally {
                    setIsGitHubLoading(false)
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2 space-x-2 bg-[#24292F] hover:bg-[#24292F]/90 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGitHubLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>Continue with GitHub</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-black hover:underline">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
