"use client";

import { useEffect, useState, useCallback } from "react";
import { UserDetailsForm } from "~/components/UserDetailsForm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import { UserCircle, LogOut, Edit2, Settings, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { ReactNode } from "react";
import { CustomToast } from "~/components/ui/custom-toast";

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
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(false);

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
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
  const hasProfileData = displayName || userDetails?.gender || userDetails?.dateOfBirth;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-lg">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <UserCircle className="h-6 sm:h-8 w-6 sm:w-8 text-primary" />
                  </div>
                )}
              </div>
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl font-bold text-gray-900"
              >
                {displayName || "Welcome"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-muted-foreground"
              >
                Manage your profile and preferences
              </motion.p>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive transition-colors text-sm sm:text-base px-3 sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isEditing ? "edit" : "view"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="border-b bg-card px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                    {isEditing ? "Edit Profile" : "Profile Details"}
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-primary/10 hover:text-primary transition-colors text-sm sm:text-base"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>{hasProfileData ? "Edit Profile" : "Complete Profile"}</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isEditing ? (
                  <UserDetailsForm
                    initialData={{
                      ...userDetails,
                      fullName: displayName,
                      dateOfBirth: userDetails?.dateOfBirth
                        ? new Date(userDetails.dateOfBirth)
                        : undefined,
                    }}
                    onUpdate={handleUpdateDetails}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {!hasProfileData ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                          {displayImage ? (
                            <Image
                              src={displayImage}
                              alt="Profile"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircle className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground/30" />
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Your profile is incomplete. Add your details to get started.
                        </p>
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="mt-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white transition-all duration-300"
                        >
                          Complete Profile
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="grid gap-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                        >
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Personal Information</h3>
                            <Settings className="h-4 sm:h-5 w-4 sm:w-5 text-blue-500" />
                          </div>
                          
                          <div className="space-y-4">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
                            >
                              <div className="min-w-[120px]">
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                              </div>
                              <p className="text-sm sm:text-base font-medium text-gray-900">{displayName}</p>
                            </motion.div>

                            {userDetails?.gender && (
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
                              >
                                <div className="min-w-[120px]">
                                  <label className="text-sm font-medium text-gray-500">Gender</label>
                                </div>
                                <p className="text-sm sm:text-base font-medium text-gray-900 capitalize">{userDetails.gender}</p>
                              </motion.div>
                            )}

                            {userDetails?.dateOfBirth && (
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
                              >
                                <div className="min-w-[120px]">
                                  <label className="text-sm font-medium text-gray-500">Birthday</label>
                                </div>
                                <p className="text-sm sm:text-base font-medium text-gray-900">
                                  {new Date(userDetails.dateOfBirth).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>

                        {(userDetails?.fbLink || userDetails?.linkedinLink) && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                          >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Social Profiles</h3>
                              <div className="flex space-x-3">
                                {userDetails.fbLink && (
                                  <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href={userDetails.fbLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                  >
                                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                    </svg>
                                  </motion.a>
                                )}
                                {userDetails.linkedinLink && (
                                  <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href={userDetails.linkedinLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                  >
                                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                                    </svg>
                                  </motion.a>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              {userDetails.fbLink && (
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 }}
                                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
                                >
                                  <div className="min-w-[120px]">
                                    <label className="text-sm font-medium text-gray-500">Facebook</label>
                                  </div>
                                  <a
                                    href={userDetails.fbLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline transition-colors break-all"
                                  >
                                    {userDetails.fbLink}
                                  </a>
                                </motion.div>
                              )}

                              {userDetails.linkedinLink && (
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 }}
                                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
                                >
                                  <div className="min-w-[120px]">
                                    <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                                  </div>
                                  <a
                                    href={userDetails.linkedinLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline transition-colors break-all"
                                  >
                                    {userDetails.linkedinLink}
                                  </a>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 