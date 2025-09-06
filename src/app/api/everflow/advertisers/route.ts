import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { everflowRequest } from "@/lib/everflow-api";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch advertisers from Everflow
    const advertisersData = await everflowRequest('advertisers');

    return NextResponse.json({
      success: true,
      data: advertisersData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Advertisers API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch advertisers",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
