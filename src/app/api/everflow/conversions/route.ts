import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { everflowRequest, ConversionReportParams } from "@/lib/everflow-api";

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
      from, 
      to, 
      timezone_id = 67, // Default to Pacific timezone
      filters = [],
      page = 1,
      page_size = 100 
    } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: "Date range (from, to) is required" },
        { status: 400 }
      );
    }

    // Build the conversion report request
    const conversionParams: ConversionReportParams = {
      from,
      to,
      timezone_id,
      show_conversions: true,
      show_events: true,
      page,
      page_size,
    };

    // Add filters if provided
    if (filters.length > 0) {
      conversionParams.query = { filters };
    }

    // Fetch conversions from Everflow
    const conversionsData = await everflowRequest(
      'reporting/conversions', 
      'POST', 
      conversionParams
    );

    return NextResponse.json({
      success: true,
      data: conversionsData,
      params: conversionParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Conversions report API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch conversions report",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
