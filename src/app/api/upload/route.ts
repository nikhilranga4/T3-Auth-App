import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return new NextResponse(
        JSON.stringify({ message: "No file uploaded" }),
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid file type. Only images are allowed." }),
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(
        JSON.stringify({ message: "File size too large. Maximum size is 5MB." }),
        { status: 400 }
      );
    }

    try {
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const url = `data:${file.type};base64,${base64String}`;

      return new NextResponse(
        JSON.stringify({ url }),
        { status: 200 }
      );
    } catch (error) {
      console.error('Error processing file:', error);
      return new NextResponse(
        JSON.stringify({ message: "Error processing file" }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error handling upload:', error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
} 