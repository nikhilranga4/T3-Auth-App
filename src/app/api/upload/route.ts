import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { v2 as cloudinary } from 'cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return new NextResponse(
        JSON.stringify({ error: "No file uploaded" }),
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid file type. Only images are allowed." }),
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(
        JSON.stringify({ error: "File size too large. Maximum size is 5MB." }),
        { status: 400 }
      );
    }

    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'user-profiles',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(buffer);
      });

      const result = await uploadPromise as { secure_url: string };

      return new NextResponse(
        JSON.stringify({ url: result.secure_url }),
        { status: 200 }
      );
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to upload image" }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error handling upload:', error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 