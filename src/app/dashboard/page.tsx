"use client";

import { useEffect, useState, useCallback } from "react";
import { UserDetailsForm } from "~/components/UserDetailsForm";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import { User, LogOut, Settings, Bell, Search, Bot, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface UserDetails {
  name?: string;
  fullName?: string;
  fbLink?: string;
  linkedinLink?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  image?: string;
}

interface FormattedUserDetails {
  fullName: string;
  fbLink: string;
  linkedinLink: string;
  gender: string;
  dateOfBirth?: Date;
  image?: string;
}

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const fetchUserDetails = useCallback(async () => {
      try {
        const response = await fetch("/api/user/details");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/signin");
            return;
          }
          throw new Error("Failed to fetch user details");
        }
      const data = (await response.json()) as UserDetails;
      setUserDetails({
        ...data,
        fullName: data.name || data.fullName,
      });
      } catch (error) {
        toast({
        variant: "destructive",
          title: "Error",
        description: "Failed to load user details"
        });
      } finally {
        setLoading(false);
      }
  }, [router]);

  useEffect(() => {
    void fetchUserDetails();
  }, [fetchUserDetails]);

  const handleSignOut = async () => {
    try {
      toast({
        title: "Signing out...",
        description: "Please wait while we sign you out"
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      await signOut({ redirect: false });

      toast({
        title: "Signed out successfully",
        description: "Thank you for using our service!"
      });

      router.push("/signin");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  const handleUpdateDetails = async (updatedData: FormattedUserDetails) => {
    try {
      setUserDetails({
        ...updatedData,
        name: updatedData.fullName,
        fullName: updatedData.fullName,
        dateOfBirth: updatedData.dateOfBirth?.toISOString(),
      });

      if (updatedData.image !== session?.user?.image) {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            image: updatedData.image,
          },
        });
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });

      // Close the form after successful update
      setTimeout(() => setShowForm(false), 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "Failed to update profile. Please try again."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  const displayImage = userDetails?.image ?? session?.user?.image;
  const displayName = userDetails?.fullName || userDetails?.name || session?.user?.name || "";
  const userName = userDetails?.fullName || session?.user?.name || "there";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Dashboard
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 dark:hover:bg-gray-800">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-gray-900" />
                </Button>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800">
                    <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-500/20 dark:ring-blue-400/20">
                      <AvatarImage src={displayImage || ""} alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        {userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
          </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => setShowForm(true)} 
                    className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 focus:bg-blue-50 dark:focus:bg-gray-700"
                  >
                    <User className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 focus:bg-red-50 dark:focus:bg-red-900/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 dark:text-white">
            Welcome
            <span className="mx-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              {userName}
            </span>
            <span className="inline-block animate-wave">👋</span>
          </h1>
          <div className="space-y-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300"
            >
              Manage your profile and explore your dashboard
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <Button
                onClick={() => router.push("/chatbot")}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 rounded-xl"
              >
                <span className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-medium">Chat with AI Assistant</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20" />
                <div className="relative">
                  <UserDetailsForm
                    initialData={userDetails ? {
                      fullName: userDetails.fullName || userDetails.name,
                      fbLink: userDetails.fbLink || "",
                      linkedinLink: userDetails.linkedinLink || "",
                      gender: userDetails.gender || "",
                      dateOfBirth: userDetails.dateOfBirth ? new Date(userDetails.dateOfBirth) : undefined,
                      image: userDetails.image
                    } : undefined}
                    onUpdate={handleUpdateDetails}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Quick Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-full lg:col-span-1"
              >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center space-y-2 h-24 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-400 transition-all duration-300"
                        onClick={() => setShowForm(true)}
                      >
                        <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span>Edit Profile</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center space-y-2 h-24 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-400 transition-all duration-300"
                      >
                        <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span>Search</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Profile Overview Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-full lg:col-span-2"
              >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <h3 className="text-lg font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="group">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                          <p className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {displayName || "Not set"}
                          </p>
                        </div>
                        <div className="group">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                          <p className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {session?.user?.email}
                          </p>
                        </div>
                        <div className="group">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                          <p className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {userDetails?.gender || "Not set"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="group">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Birth</p>
                          <p className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {userDetails?.dateOfBirth ? new Date(userDetails.dateOfBirth).toLocaleDateString() : "Not set"}
                          </p>
                        </div>
                        <div className="group">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">LinkedIn Profile</p>
                          {userDetails?.linkedinLink ? (
                          <a
                            href={userDetails.linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                              className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate block"
                          >
                            {userDetails.linkedinLink}
                          </a>
                          ) : (
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Not set
                        </p>
                          )}
                      </div>
                        <div className="group">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Facebook Profile</p>
                          {userDetails?.fbLink ? (
                            <a 
                              href={userDetails.fbLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate block"
                            >
                              {userDetails.fbLink}
                            </a>
                          ) : (
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Not set
                            </p>
                          )}
                        </div>
                      </div>
                      </div>
                  </div>
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
} 