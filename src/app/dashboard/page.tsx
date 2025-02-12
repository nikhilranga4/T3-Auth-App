"use client";

import { useEffect, useState } from "react";
import { UserDetailsForm } from "~/components/UserDetailsForm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import { UserCircle, LogOut, Edit2 } from "lucide-react";
import Image from "next/image";

interface UserDetails {
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

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/user/details");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/signin");
          return;
        }
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/signin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDetails = async (updatedData: FormattedUserDetails) => {
    setUserDetails({
      ...updatedData,
      dateOfBirth: updatedData.dateOfBirth?.toISOString(),
    });
    setIsEditing(false);

    // Update session with new image if it changed
    if (updatedData.image !== session?.user?.image) {
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: updatedData.image,
        },
      });
    }
  };

  const displayImage = userDetails?.image || session?.user?.image;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <div className="bg-primary/10 p-3 rounded-full w-full h-full flex items-center justify-center">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userDetails?.fullName || session?.user?.name || "My Profile"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-card px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Profile Details</CardTitle>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>{userDetails?.fullName ? "Edit Profile" : "Complete Profile"}</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing ? (
              <UserDetailsForm
                initialData={{
                  ...userDetails,
                  dateOfBirth: userDetails?.dateOfBirth
                    ? new Date(userDetails.dateOfBirth)
                    : undefined,
                }}
                onUpdate={handleUpdateDetails}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-6">
                {!userDetails?.fullName ? (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-12 w-12 text-muted-foreground/30" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Your profile is incomplete. Add your details to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-base">{userDetails.fullName}</p>
                    </div>

                    {userDetails.gender && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <p className="text-base capitalize">{userDetails.gender}</p>
                      </div>
                    )}

                    {userDetails.dateOfBirth && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-base">
                          {new Date(userDetails.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    {userDetails.fbLink && (
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Facebook Profile</label>
                        <p className="text-base">
                          <a
                            href={userDetails.fbLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {userDetails.fbLink}
                          </a>
                        </p>
                      </div>
                    )}

                    {userDetails.linkedinLink && (
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">LinkedIn Profile</label>
                        <p className="text-base">
                          <a
                            href={userDetails.linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {userDetails.linkedinLink}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 