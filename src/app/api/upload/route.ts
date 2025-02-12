import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
        JSON.stringify({ message: "Invalid file type" }),
        { status: 400 }
      );
    }

    // Get file extension
    const ext = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await writeFile(join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      console.error('Error saving file:', error);
      return new NextResponse(
        JSON.stringify({ message: "Error saving file" }),
        { status: 500 }
      );
    }

    const url = `/uploads/${fileName}`;

    return new NextResponse(
      JSON.stringify({ url }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling upload:', error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
} 