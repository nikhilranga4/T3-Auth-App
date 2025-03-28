"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, X, Upload, Camera, Trash2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "./ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface UserDetailsFormProps {
  initialData?: {
    fullName?: string;
    fbLink?: string;
    linkedinLink?: string;
    gender?: string;
    dateOfBirth?: Date;
    image?: string;
  };
  onUpdate?: (data: {
    fullName: string;
    fbLink: string;
    linkedinLink: string;
    gender: string;
    dateOfBirth?: Date;
    image?: string;
  }) => void;
  onCancel?: () => void;
}

interface UploadResponse {
  url: string;
}

interface ErrorResponse {
  error: string;
}

export function UserDetailsForm({ initialData, onUpdate, onCancel }: UserDetailsFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [fbLink, setFbLink] = useState(initialData?.fbLink ?? "");
  const [linkedinLink, setLinkedinLink] = useState(initialData?.linkedinLink ?? "");
  const [gender, setGender] = useState(initialData?.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined
  );
  const [image, setImage] = useState<string | undefined>(initialData?.image);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size too large. Maximum size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setImage(data.url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          fbLink: fbLink || null,
          linkedinLink: linkedinLink || null,
          gender: gender || null,
          dateOfBirth: dateOfBirth?.toISOString() || null,
          image: image || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update user details");
      }

      if (onUpdate) {
        onUpdate({
          fullName,
          fbLink,
          linkedinLink,
          gender,
          dateOfBirth,
          image,
        });
      }

      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="relative group">
          <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-400 transition-colors duration-300">
            {image ? (
              <Image
                src={image}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400" />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="absolute -bottom-2 right-0 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full p-1.5 sm:p-2 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 dark:text-gray-200"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-primary" />
              ) : (
                <Upload className="h-3 sm:h-4 w-3 sm:w-4" />
              )}
            </Button>
            {image && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full p-1.5 sm:p-2 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 dark:text-gray-200"
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:gap-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="h-9 sm:h-10 transition-all duration-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-muted-foreground">
              Gender
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-9 sm:h-10 transition-all duration-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="male" className="dark:text-gray-100 dark:focus:bg-gray-700">Male</SelectItem>
                <SelectItem value="female" className="dark:text-gray-100 dark:focus:bg-gray-700">Female</SelectItem>
                <SelectItem value="other" className="dark:text-gray-100 dark:focus:bg-gray-700">Other</SelectItem>
                <SelectItem value="prefer-not-to-say" className="dark:text-gray-100 dark:focus:bg-gray-700">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fbLink" className="text-sm font-medium text-muted-foreground">
              Facebook Profile Link
            </Label>
            <Input
              id="fbLink"
              value={fbLink}
              onChange={(e) => setFbLink(e.target.value)}
              placeholder="https://facebook.com/your.profile"
              type="url"
              className="h-9 sm:h-10 transition-all duration-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinLink" className="text-sm font-medium text-muted-foreground">
              LinkedIn Profile Link
            </Label>
            <Input
              id="linkedinLink"
              value={linkedinLink}
              onChange={(e) => setLinkedinLink(e.target.value)}
              placeholder="https://linkedin.com/in/your.profile"
              type="url"
              className="h-9 sm:h-10 transition-all duration-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Date of Birth
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-9 sm:h-10 justify-start text-left font-normal transition-all duration-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700",
                  !dateOfBirth && "text-muted-foreground dark:text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? (
                  format(dateOfBirth, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
              <Calendar
                selected={dateOfBirth}
                onSelect={setDateOfBirth}
                className="rounded-lg border shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t"
      >
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-9 sm:h-10 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 transition-colors duration-300"
            disabled={loading}
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
        )}
        <Button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 h-9 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white dark:from-blue-500 dark:to-blue-300 dark:hover:from-blue-400 dark:hover:to-blue-200 transition-all duration-300"
          disabled={loading || uploadingImage}
        >
          <Save className="h-4 w-4" />
          <span>{loading ? "Saving..." : "Save Changes"}</span>
        </Button>
      </motion.div>
    </form>
  );
} 