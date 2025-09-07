import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { everflowRequest } from "@/lib/everflow-api";

// Mock data for when no offers are returned or API key is not configured
const mockOffers = [
  {
    network_offer_id: 1,
    name: "Mobile Gaming CPA - iOS",
    offer_status: "active",
    currency_id: "USD",
    default_payout: 25.00,
    default_revenue: 35.00,
    preview_url: "https://example.com/mobile-gaming",
    offer_url: "https://track.example.com/click/1",
    advertiser: {
      network_advertiser_id: 1,
      name: "GameCorp Inc."
    },
    category: "Gaming",
    countries: ["US", "CA", "GB"],
    description: "Premium mobile gaming app with high conversion rates",
    time_created: Date.now() - 86400000 * 30,
    time_saved: Date.now() - 86400000,
  },
  {
    network_offer_id: 2,
    name: "E-commerce Fashion - RevShare",
    offer_status: "active", 
    currency_id: "USD",
    default_payout: 15.00,
    default_revenue: 25.00,
    preview_url: "https://example.com/fashion-store",
    offer_url: "https://track.example.com/click/2",
    advertiser: {
      network_advertiser_id: 2,
      name: "Fashion Forward LLC"
    },
    category: "Fashion",
    countries: ["US", "CA", "AU"],
    description: "Trendy fashion e-commerce with high AOV",
    time_created: Date.now() - 86400000 * 20,
    time_saved: Date.now() - 86400000 * 2,
  },
  {
    network_offer_id: 3,
    name: "Financial Services Lead Gen",
    offer_status: "active",
    currency_id: "USD", 
    default_payout: 45.00,
    default_revenue: 65.00,
    preview_url: "https://example.com/finance-leads",
    offer_url: "https://track.example.com/click/3",
    advertiser: {
      network_advertiser_id: 3,
      name: "FinTech Solutions"
    },
    category: "Finance",
    countries: ["US"],
    description: "High-quality financial services lead generation",
    time_created: Date.now() - 86400000 * 15,
    time_saved: Date.now() - 86400000 * 3,
  },
  {
    network_offer_id: 4,
    name: "Health & Wellness CPL",
    offer_status: "paused",
    currency_id: "USD",
    default_payout: 12.50,
    default_revenue: 20.00,
    preview_url: "https://example.com/health-wellness",
    offer_url: "https://track.example.com/click/4",
    advertiser: {
      network_advertiser_id: 4,
      name: "WellBeing Corp"
    },
    category: "Health",
    countries: ["US", "CA"],
    description: "Health and wellness cost per lead campaign",
    time_created: Date.now() - 86400000 * 45,
    time_saved: Date.now() - 86400000 * 5,
  },
  {
    network_offer_id: 5,
    name: "Travel Booking CPS",
    offer_status: "active",
    currency_id: "USD",
    default_payout: 8.00,
    default_revenue: 12.00,
    preview_url: "https://example.com/travel-booking",
    offer_url: "https://track.example.com/click/5",
    advertiser: {
      network_advertiser_id: 5,
      name: "TravelMax Agency"
    },
    category: "Travel",
    countries: ["US", "CA", "GB", "AU"],
    description: "Global travel booking with competitive commissions",
    time_created: Date.now() - 86400000 * 10,
    time_saved: Date.now() - 86400000,
  }
];

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

    try {
      // Fetch offers from Everflow
      const offersData = await everflowRequest(
        'offerstable', 
        'POST', 
        offersParams
      );

      // Extract offers array from response
      const offers = offersData?.offers || [];

      // Normalize the offers data to ensure consistent structure
      const normalizedOffers = offers.map((offer: any) => ({
        ...offer,
        // Ensure advertiser structure is consistent
        advertiser: offer.advertiser || { 
          network_advertiser_id: offer.network_advertiser_id || 0,
          name: offer.advertiser_name || 'Unknown' 
        },
        // Ensure URLs are present
        preview_url: offer.preview_url || offer.destination_url || '',
        offer_url: offer.offer_url || offer.tracking_url || '',
        // Ensure numeric fields
        default_payout: Number(offer.default_payout) || 0,
        default_revenue: Number(offer.default_revenue) || 0,
      }));

      // If no offers returned from API, use mock data for demo
      const finalOffers = normalizedOffers.length > 0 ? normalizedOffers : mockOffers;

      return NextResponse.json({
        success: true,
        data: finalOffers,
        paging: offersData?.paging,
        params: offersParams,
        timestamp: new Date().toISOString(),
        usingMockData: normalizedOffers.length === 0,
      });
    } catch (apiError) {
      console.log('Everflow API error, returning mock data:', apiError);
      
      // Return mock data when API fails
      return NextResponse.json({
        success: true,
        data: mockOffers,
        params: offersParams,
        timestamp: new Date().toISOString(),
        usingMockData: true,
        apiError: apiError instanceof Error ? apiError.message : 'API Error',
      });
    }
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

    try {
      // Fetch all offers with basic parameters
      const offersData = await everflowRequest(
        'offerstable', 
        'POST', 
        {
          page: 1,
          page_size: 100,
        }
      );

      // Extract offers array from response
      const offers = offersData?.offers || [];

      // Normalize the offers data to ensure consistent structure
      const normalizedOffers = offers.map((offer: any) => ({
        ...offer,
        // Ensure advertiser structure is consistent
        advertiser: offer.advertiser || { 
          network_advertiser_id: offer.network_advertiser_id || 0,
          name: offer.advertiser_name || 'Unknown' 
        },
        // Ensure URLs are present
        preview_url: offer.preview_url || offer.destination_url || '',
        offer_url: offer.offer_url || offer.tracking_url || '',
        // Ensure numeric fields
        default_payout: Number(offer.default_payout) || 0,
        default_revenue: Number(offer.default_revenue) || 0,
      }));

      // If no offers returned from API, use mock data for demo
      const finalOffers = normalizedOffers.length > 0 ? normalizedOffers : mockOffers;

      return NextResponse.json({
        success: true,
        data: finalOffers,
        paging: offersData?.paging,
        timestamp: new Date().toISOString(),
        usingMockData: normalizedOffers.length === 0,
      });
    } catch (apiError) {
      console.log('Everflow API error, returning mock data:', apiError);
      
      // Return mock data when API fails
      return NextResponse.json({
        success: true,
        data: mockOffers,
        timestamp: new Date().toISOString(),
        usingMockData: true,
        apiError: apiError instanceof Error ? apiError.message : 'API Error',
      });
    }
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
