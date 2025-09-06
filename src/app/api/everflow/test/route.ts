import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Test environment variables
    const apiKey = process.env.EF_API_KEY;
    const apiUrl = process.env.EF_API_URL;

    return NextResponse.json({
      success: true,
      message: "Everflow API test endpoint",
      environment: {
        hasApiKey: !!apiKey,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set',
        apiUrl: apiUrl || 'Not set',
      },
      user: {
        userId,
        authenticated: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { 
        error: "Test failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
