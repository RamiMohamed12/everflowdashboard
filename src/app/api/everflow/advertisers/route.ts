import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { everflowRequest } from "@/lib/everflow-api";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json()
    
    const {
      page = 1,
      page_size = 100,
      search_terms = [],
      filters = [],
      sort = [{ field: "network_advertiser_id", direction: "desc" }]
    } = body

    const requestBody = {
      page,
      page_size,
      search_terms,
      filters: {
        // Default filters for advertisers
        ...filters.reduce((acc: any, filter: any) => {
          acc[filter.field] = filter.value;
          return acc;
        }, {})
      },
      sort
    }

    // Try the basic advertisers endpoint first since advertiserstable might not exist
    const result = await everflowRequest('advertisers', 'GET')

    if (result && result.advertisers) {
      // Process and enhance the data
      const processedAdvertisers = result.advertisers.map((advertiser: any) => ({
        ...advertiser,
        today_revenue_amount: parseFloat(advertiser.today_revenue?.replace(/[$,]/g, '') || '0'),
        created_date: new Date(advertiser.time_created * 1000),
        updated_date: new Date(advertiser.time_saved * 1000),
        labels: advertiser.labels || []
      }))

      return NextResponse.json({
        success: true,
        data: processedAdvertisers,
        paging: result.paging,
        timestamp: new Date().toISOString()
      })
    } else if (result && Array.isArray(result)) {
      // Handle case where advertisers are returned directly as an array
      const processedAdvertisers = result.map((advertiser: any) => ({
        ...advertiser,
        today_revenue_amount: parseFloat(advertiser.today_revenue?.replace(/[$,]/g, '') || '0'),
        created_date: new Date(advertiser.time_created * 1000),
        updated_date: new Date(advertiser.time_saved * 1000),
        labels: advertiser.labels || []
      }))

      return NextResponse.json({
        success: true,
        data: processedAdvertisers,
        paging: { page: 1, page_size: processedAdvertisers.length, total_count: processedAdvertisers.length },
        timestamp: new Date().toISOString()
      })
    } else {
      throw new Error('Invalid response from advertisers API')
    }

  } catch (error) {
    console.error('Advertisers API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url)
    const advertiserId = searchParams.get('advertiserId')
    const relationship = searchParams.get('relationship')
    
    let endpoint = 'advertisers'
    if (advertiserId) {
      endpoint = `advertisers/${advertiserId}`
      if (relationship) {
        endpoint += `?relationship=${relationship}`
      }
    }

    const result = await everflowRequest(endpoint, 'GET')
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Advertisers GET API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
