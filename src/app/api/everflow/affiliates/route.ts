import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { everflowRequest } from "@/lib/everflow-api";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      page = 1,
      page_size = 50,
      search = "",
      filters = []
    } = body;

    // Build the affiliates request payload
    const affiliatesParams = {
      page,
      page_size,
      search_terms: search ? [search] : [],
      query: filters.length > 0 ? { filters } : undefined,
    };

    // Fetch affiliates from Everflow
    const affiliatesData = await everflowRequest(
      'affiliatestable', 
      'POST', 
      affiliatesParams
    );

    return NextResponse.json({
      success: true,
      data: affiliatesData,
      params: affiliatesParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Affiliates API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch affiliates",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all affiliates with basic parameters
    const affiliatesData = await everflowRequest(
      'affiliatestable', 
      'POST', 
      {
        page: 1,
        page_size: 100,
      }
    );

    return NextResponse.json({
      success: true,
      data: affiliatesData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Affiliates GET API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch affiliates",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
