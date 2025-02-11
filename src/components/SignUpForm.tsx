'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Loader2, User, Mail, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
}

const staggeredContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface FormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function SignUpForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  async function signUpWithGoogle() {
    setIsGoogleLoading(true)

    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Failed to sign in with Google",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "An error occurred while signing in with Google",
        duration: 5000,
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const validateForm = (values: FormValues): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    if (!values.name?.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    if (!values.email?.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Invalid email format'
      isValid = false
    }

    if (!values.password) {
      errors.password = 'Password is required'
      isValid = false
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const checkEmailAvailability = async (email: string) => {
    try {
      setIsCheckingEmail(true)
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (!response.ok && data.message === 'Email already registered') {
        setFormErrors(prev => ({ ...prev, email: 'This email is already registered' }))
        return false
      }
      return true
    } catch (error) {
      console.error('Error checking email:', error)
      return true // Continue with registration attempt if check fails
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const values = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string
    }

    if (!validateForm(values)) {
      return
    }

    try {
      setIsLoading(true)

      // Check email availability first
      const isEmailAvailable = await checkEmailAvailability(values.email)
      if (!isEmailAvailable) {
        toast({
          variant: "destructive",
          title: "Email already registered",
          description: "Please use a different email address or try signing in",
          duration: 5000,
          action: (
            <Icons.SignIn altText="Sign in" onClick={() => router.push('/signin')}>
              Sign in
            </Icons.SignIn>
          ),
        })
        return
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
            name: values.name
          })
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 400) {
            if (data.message === 'Email already registered') {
              toast({
                variant: "destructive",
                title: "Email already registered",
                description: "Please use a different email address or try signing in",
                duration: 5000,
                action: (
                  <Icons.SignIn altText="Sign in" onClick={() => router.push('/login')}>
                    Sign in
                  </Icons.SignIn>
                ),
              })
              return
            }
            
            // Handle other validation errors
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: data.message || 'Please check your input',
              duration: 5000,
            })
            return
          }
          
          throw new Error(data?.message || 'Failed to register')
        }
      } catch (error) {
        console.error('Registration request error:', error)
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          duration: 5000,
        })
        return
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome aboard! Signing you in...",
        duration: 3000,
      })

      // Add a small delay before attempting to sign in
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
        })

        if (!signInResult) {
          throw new Error('Authentication failed')
        }

        if (signInResult.error) {
          throw new Error(signInResult.error)
        }

        if (!signInResult.ok) {
          throw new Error('Failed to sign in')
        }

        setIsRedirecting(true)
        toast({
          title: "Success!",
          description: "You're now signed in. Redirecting to dashboard...",
          duration: 3000,
        })

        // Add a delay before redirecting
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/dashboard')

      } catch (signInError: any) {
        console.error('Sign in error:', signInError)
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "Registration successful but automatic sign-in failed. Please try signing in manually.",
          duration: 5000,
          action: (
            <Icons.SignIn altText="Sign in" onClick={() => router.push('/signin')}>
              Sign in
            </Icons.SignIn>
          ),
        })
        // Redirect to sign in page after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/signin')
      }

    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || 'An error occurred during registration',
        duration: 5000,
        action: (
          <Icons.TryAgain altText="Try again">Try again</Icons.TryAgain>
        ),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signUpWithGitHub = async () => {
    try {
      setIsGitHubLoading(true)
      const result = await signIn('github', {
        callbackUrl: '/dashboard',
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
      console.error('GitHub sign up error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem signing up with GitHub",
      })
    } finally {
      setIsGitHubLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-4"
    >
      <Card className="bg-white text-black p-6 rounded-2xl shadow-xl border border-gray-700 relative w-full max-w-md">
        <CardHeader className="space-y-1 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-center mt-2 text-gray-600 dark:text-gray-400">
              Begin your journey with us
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.form
            variants={staggeredContainer}
            initial="initial"
            animate="animate"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <motion.div variants={fadeInUp}>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  </div>
                  <Input
                    name="name"
                    className="pl-10 bg-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-black dark:focus:ring-white transition-all h-9"
                    placeholder="Full Name"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  </div>
                  <Input
                    name="email"
                    type="email"
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-black dark:focus:ring-white transition-all h-9"
                    placeholder="name@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  </div>
                  <Input
                    name="password"
                    type="password"
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-black dark:focus:ring-white transition-all h-9"
                    placeholder="••••••••"
                  />
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  </div>
                  <Input
                    name="confirmPassword"
                    type="password"
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-black dark:focus:ring-white transition-all h-9"
                    placeholder="••••••••"
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="space-y-3 pt-2"
            >
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white transition-all duration-200 group h-9"
                disabled={isLoading || isRedirecting || isCheckingEmail}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Sign up
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-black dark:text-white hover:underline transition-all"
                >
                  Sign in
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-1">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={signUpWithGoogle}
                  className="w-full bg-white hover:bg-gray-50 text-black border border-gray-300 h-9"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                  )}
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  disabled={isGitHubLoading}
                  onClick={signUpWithGitHub}
                  className="w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white h-9"
                >
                  {isGitHubLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  Continue with GitHub
                </Button>
              </div>
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  )
}