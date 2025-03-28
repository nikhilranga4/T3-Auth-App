import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate response using Gemini with safety settings
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    
    if (!response || !response.text) {
      throw new Error("Invalid response from Gemini API");
    }

    const text = response.text();
    
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Invalid or expired API key" },
          { status: 401 }
        );
      }
      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "API quota exceeded" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
} 