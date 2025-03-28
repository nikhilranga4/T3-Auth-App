"use client";

import { Button } from "~/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 rounded-full blur-xl opacity-20 animate-pulse" />
            <h1 className="relative text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 font-heading tracking-tight">
              Welcome to T3 Authentication
            </h1>
          </div>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed font-sans"
          >
            A secure authentication system with advanced profile management
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">New Here?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Create an account to get started with personalized profile management.</p>
              <Link href="/signup" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-400 hover:from-blue-500 hover:to-blue-300 dark:hover:from-blue-400 dark:hover:to-blue-300 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300"
                  >
                    Create Account
                  </Button>
                </motion.div>
              </Link>
            </div>

            <div className="p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Sign in to your account to continue where you left off. Update your profile</p>
              <Link href="/signin" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-11 text-base font-medium border-2 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Secure and seamless authentication experience
          </p>
        </motion.div>
      </motion.div>

      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.3, rotate: 12 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-50 dark:from-blue-900/20 to-transparent"
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.3, rotate: -12 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-50 dark:from-indigo-900/20 to-transparent"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-100 dark:from-blue-900/30 via-transparent to-indigo-100 dark:to-indigo-900/30"
        />
      </div>
    </div>
  );
}

