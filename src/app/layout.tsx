import './globals.css'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'User Authentication App',
  description: 'A modern authentication app with user profile management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
