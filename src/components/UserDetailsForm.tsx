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
import { Calendar as CalendarIcon, Save, X, Upload, Camera } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "./ui/use-toast";

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

export function UserDetailsForm({ initialData, onUpdate, onCancel }: UserDetailsFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [fbLink, setFbLink] = useState(initialData?.fbLink ?? "");
  const [linkedinLink, setLinkedinLink] = useState(initialData?.linkedinLink ?? "");
  const [gender, setGender] = useState(initialData?.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    initialData?.dateOfBirth
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
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
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
          fbLink,
          linkedinLink,
          gender,
          dateOfBirth,
          image,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user details");
      }

      const updatedData = await response.json();
      
      toast({
        title: "Success",
        description: "Your details have been updated successfully.",
      });

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
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
                <Camera className="h-12 w-12 text-gray-400" />
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute bottom-0 right-0 rounded-full p-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">
            Full Name
          </Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium text-muted-foreground">
            Gender
          </Label>
          <Select value={gender} onValueChange={setGender} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            className="w-full"
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
            className="w-full"
          />
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
                  "w-full justify-start text-left font-normal",
                  !dateOfBirth && "text-muted-foreground"
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
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                selected={dateOfBirth}
                onSelect={setDateOfBirth}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
        )}
        <Button
          type="submit"
          className="flex items-center space-x-2"
          disabled={loading || uploadingImage}
        >
          <Save className="h-4 w-4" />
          <span>{loading ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </form>
  );
} 