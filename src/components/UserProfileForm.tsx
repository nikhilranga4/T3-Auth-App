'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import ClientOnly from './ClientOnly'

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  fbLink: z.string().url('Invalid Facebook URL').optional().nullable(),
  linkedinLink: z.string().url('Invalid LinkedIn URL').optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.date().optional().nullable(),
})

type FormData = z.infer<typeof formSchema>

interface UserProfileFormProps {
  userId: string
  initialData?: FormData
}

export function UserProfileForm({ userId, initialData }: UserProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  const dateOfBirth = watch('dateOfBirth')

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.fullName) {
        setError('Full name is required')
        return
      }

      setIsLoading(true)
      setError('')
      setSuccess(false)

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          fullName: data.fullName,
          fbLink: data.fbLink || null,
          linkedinLink: data.linkedinLink || null,
          gender: data.gender || null,
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile')
      }

      setSuccess(true)
      // Show success message
      const successTimeout = setTimeout(() => setSuccess(false), 3000)
      return () => clearTimeout(successTimeout)
    } catch (error: any) {
      console.error('Profile update error:', error)
      setError(error.message || 'An error occurred while updating your profile')
      // Clear error after 5 seconds
      const errorTimeout = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(errorTimeout)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ClientOnly>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1">
              <input
                {...register('fullName')}
                type="text"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.fullName.message}
                </motion.p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="fbLink" className="block text-sm font-medium text-gray-700">
              Facebook Profile
            </label>
            <div className="mt-1">
              <input
                {...register('fbLink')}
                type="url"
                placeholder="https://facebook.com/your-profile"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.fbLink && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.fbLink.message}
                </motion.p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="linkedinLink" className="block text-sm font-medium text-gray-700">
              LinkedIn Profile
            </label>
            <div className="mt-1">
              <input
                {...register('linkedinLink')}
                type="url"
                placeholder="https://linkedin.com/in/your-profile"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.linkedinLink && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.linkedinLink.message}
                </motion.p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <div className="mt-1">
              <select
                {...register('gender')}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.gender.message}
                </motion.p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <div className="mt-1">
              <DatePicker
                selected={dateOfBirth}
                onChange={(date) => setValue('dateOfBirth', date)}
                dateFormat="MMMM d, yyyy"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                showYearDropdown
                dropdownMode="select"
              />
              {errors.dateOfBirth && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.dateOfBirth.message}
                </motion.p>
              )}
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-md bg-red-50 p-4"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-md bg-green-50 p-4"
            >
              <p className="text-sm text-green-600">Profile updated successfully!</p>
            </motion.div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center"
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating profile...
                </motion.div>
              ) : (
                'Update Profile'
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </ClientOnly>
  )
}
