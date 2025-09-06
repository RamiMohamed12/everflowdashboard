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

    // Build the offers request payload
    const offersParams = {
      page,
      page_size,
      search_terms: search ? [search] : [],
      query: filters.length > 0 ? { filters } : undefined,
    };

    // Fetch offers from Everflow
    const offersData = await everflowRequest(
      'offerstable', 
      'POST', 
      offersParams
    );

    return NextResponse.json({
      success: true,
      data: offersData,
      params: offersParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Offers API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch offers",
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

    // Fetch all offers with basic parameters
    const offersData = await everflowRequest(
      'offerstable', 
      'POST', 
      {
        page: 1,
        page_size: 100,
      }
    );

    return NextResponse.json({
      success: true,
      data: offersData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Offers GET API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch offers",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
