import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { everflowRequest } from "@/lib/everflow-api";

interface ProfitByEntity {
  id: string;
  name: string;
  profit: number;
  conversions: number;
  revenue: number;
  payout: number;
}

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
      timezone_id = 67,
      groupBy = 'offer', // 'offer' or 'affiliate'
      limit = 10
    } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: "Date range (from, to) is required" },
        { status: 400 }
      );
    }

    // Fetch conversions for the date range with approved status
    const conversionParams = {
      from,
      to,
      timezone_id,
      show_conversions: true,
      show_events: true,
      page_size: 1000, // Get more data for aggregation
      query: {
        filters: [
          {
            filter_id_value: "approved",
            resource_type: "status"
          }
        ]
      }
    };

    const conversionsData = await everflowRequest(
      'reporting/conversions', 
      'POST', 
      conversionParams
    );

    // Process conversions to calculate profit by entity
    const entityMap = new Map<string, ProfitByEntity>();

    if (conversionsData.conversions && Array.isArray(conversionsData.conversions)) {
      conversionsData.conversions.forEach((conversion: any) => {
        let entityId: string;
        let entityName: string;

        if (groupBy === 'offer') {
          entityId = conversion.relationship?.offer?.network_offer_id?.toString() || 'unknown';
          entityName = conversion.relationship?.offer?.name || 'Unknown Offer';
        } else {
          entityId = conversion.relationship?.affiliate?.network_affiliate_id?.toString() || 'unknown';
          entityName = conversion.relationship?.affiliate?.name || 'Unknown Affiliate';
        }

        if (!entityMap.has(entityId)) {
          entityMap.set(entityId, {
            id: entityId,
            name: entityName,
            profit: 0,
            conversions: 0,
            revenue: 0,
            payout: 0,
          });
        }

        const entity = entityMap.get(entityId)!;
        entity.conversions += 1;
        entity.revenue += conversion.revenue || 0;
        entity.payout += conversion.payout || 0;
        entity.profit += (conversion.revenue || 0) - (conversion.payout || 0);
      });
    }

    // Convert to array and sort by profit
    const profitData = Array.from(entityMap.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        profits: profitData,
        groupBy,
        dateRange: { from, to },
        totalEntities: entityMap.size,
        totalConversions: conversionsData.conversions?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Profit data API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch profit data",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
