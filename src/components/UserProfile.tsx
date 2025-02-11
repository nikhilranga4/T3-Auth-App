'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useToast } from './ui/use-toast'

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  fbLink: z.string().url('Invalid Facebook URL').optional().nullable(),
  linkedinLink: z.string().url('Invalid LinkedIn URL').optional().nullable(),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.date({
    required_error: "Please select a date",
  }),
})

type FormData = z.infer<typeof formSchema>

interface UserProfileProps {
  userId: string
  initialData?: Partial<FormData>
  onProfileUpdate: (data: FormData) => void
}

export function UserProfile({ userId, initialData, onProfileUpdate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(!initialData?.fullName)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      fbLink: initialData?.fbLink || '',
      linkedinLink: initialData?.linkedinLink || '',
      gender: initialData?.gender || undefined,
      dateOfBirth: initialData?.dateOfBirth || undefined,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      onProfileUpdate(updatedProfile)
      setIsEditing(false)
      
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const profileContent = !isEditing ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-indigo-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
          <p className="text-lg font-semibold text-gray-900">{initialData?.fullName || '-'}</p>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-indigo-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Gender</h3>
          <p className="text-lg font-semibold text-gray-900 capitalize">{initialData?.gender || '-'}</p>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-indigo-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Date of Birth</h3>
          <p className="text-lg font-semibold text-gray-900">
            {initialData?.dateOfBirth ? format(new Date(initialData.dateOfBirth), 'PPP') : '-'}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-indigo-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Facebook Profile</h3>
          <p className="text-lg">
            {initialData?.fbLink ? (
              <a
                href={initialData.fbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                View Profile
              </a>
            ) : (
              <span className="text-gray-400">Not provided</span>
            )}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-indigo-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">LinkedIn Profile</h3>
          <p className="text-lg">
            {initialData?.linkedinLink ? (
              <a
                href={initialData.linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                View Profile
              </a>
            ) : (
              <span className="text-gray-400">Not provided</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() => setIsEditing(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Update Details
        </Button>
      </div>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fbLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook Profile</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://facebook.com/your-profile" 
                    {...field} 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedinLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://linkedin.com/in/your-profile" 
                    {...field} 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base">Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal h-11 rounded-lg",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="start"
                  >
                    <div className="rounded-lg border bg-card shadow-sm min-w-[270px]">
                      <Calendar
                        selected={field.value}
                        onSelect={field.onChange}
                        className="p-0"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            {initialData?.fullName && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : initialData?.fullName ? 'Update Profile' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )

  return (
    <Card className="w-full bg-white/80 backdrop-blur-lg shadow-xl border-indigo-50">
      <CardHeader className="space-y-1 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {!initialData?.fullName ? 'Complete Your Profile' : 'Profile Details'}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {!initialData?.fullName
              ? 'Please provide your information to complete your profile'
              : 'View and manage your profile information'}
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {profileContent}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
