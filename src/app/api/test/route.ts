import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
} 