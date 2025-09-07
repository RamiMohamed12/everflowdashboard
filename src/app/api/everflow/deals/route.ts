import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server";
import { everflowRequest } from "@/lib/everflow-api";

interface DealProduct {
  network_advertiser_deal_product_id: number
  network_advertiser_deal_id: number
  product_name: string
  product_url: string
  before_discount_price: number
  after_discount_price: number
  retail_price: number
  discount_percentage: number
  price_currency_id: string
}

interface DealResource {
  network_advertiser_deal_resource_id: number
  network_advertiser_deal_id: number
  resource_type: string
  html_code: string
  width: number
  height: number
  relationship?: {
    assets: any[]
  }
}

interface Deal {
  network_advertiser_deal_id: number
  network_id: number
  name: string
  brand_name: string
  deal_type: string
  deal_status: string
  deal_categories: string[]
  description: string
  restrictions: string
  scope: string
  coupon_code: string
  coupon_code_discount_percentage: number
  coupon_code_discount_amount: number
  coupon_code_discount_currency_id: string
  threshold_quantity: number
  threshold_amount: number
  threshold_amount_currency_id: string
  purchase_limit_quantity: number
  purchase_limit_amount: number
  purchase_limit_amount_currency_id: string
  date_valid_from: number
  date_valid_to: number
  date_valid_timezone_id: number
  has_products?: boolean
  has_locations?: boolean
  relationship?: {
    deal_resources?: DealResource[]
    deal_products?: DealProduct[]
    offers?: any[]
  }
  time_saved: number
  time_created: number
  time_deleted: number
}

interface DealsResponse {
  deals: Deal[]
  paging?: {
    page: number
    page_size: number
    total_count: number
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
    const network_offer_ids = searchParams.get('network_offer_ids')

    try {
      // Prepare request body for POST request
      const requestBody: any = {}
      
      if (network_offer_ids) {
        const offerIds = network_offer_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        if (offerIds.length > 0) {
          requestBody.filters = {
            network_offer_ids: offerIds
          }
        }
      }

      console.log('Fetching deals from Everflow API with body:', requestBody)

      // Try different endpoints as deals might not have a direct table endpoint
      let data: DealsResponse;
      try {
        // First try dealstable
        data = await everflowRequest('dealstable', 'POST', requestBody);
      } catch (error1) {
        try {
          // Try advertiserdeals
          data = await everflowRequest('advertiserdeals', 'POST', requestBody);
        } catch (error2) {
          try {
            // Try advertisers endpoint which might contain deals
            const advertiserData = await everflowRequest('advertisers', 'GET');
            // For now, return empty deals array if advertisers endpoint works
            data = { deals: [] };
          } catch (error3) {
            throw error1; // Throw the original dealstable error
          }
        }
      }
      console.log('Everflow deals API response:', data)

      return NextResponse.json({
        data: data,
        source: 'everflow-api'
      })

    } catch (apiError) {
      console.error('Error calling Everflow API:', apiError)
      return getMockDealsData(network_offer_ids)
    }

  } catch (error) {
    console.error('Error in deals API route:', error)
    return getMockDealsData(null)
  }
}

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
    
    try {
      console.log('Fetching deals from Everflow API with body:', body)

      // Try different endpoints as deals might not have a direct table endpoint
      let data: DealsResponse;
      try {
        // First try dealstable
        data = await everflowRequest('dealstable', 'POST', body);
      } catch (error1) {
        try {
          // Try advertiserdeals
          data = await everflowRequest('advertiserdeals', 'POST', body);
        } catch (error2) {
          try {
            // Try advertisers endpoint which might contain deals
            const advertiserData = await everflowRequest('advertisers', 'GET');
            // For now, return empty deals array if advertisers endpoint works
            data = { deals: [] };
          } catch (error3) {
            throw error1; // Throw the original dealstable error
          }
        }
      }
      console.log('Everflow deals API response:', data)

      return NextResponse.json({
        data: data,
        source: 'everflow-api'
      })

    } catch (apiError) {
      console.error('Error calling Everflow API:', apiError)
      return getMockDealsData(null)
    }

  } catch (error) {
    console.error('Error in deals API route:', error)
    return getMockDealsData(null)
  }
}

function getMockDealsData(network_offer_ids: string | null) {
  console.log('Using mock deals data')

  const mockDeals: Deal[] = [
    {
      network_advertiser_deal_id: 1,
      network_id: 1,
      name: "Summer Sale - 25% Off",
      brand_name: "TechStore Pro",
      deal_type: "coupon",
      deal_status: "active",
      deal_categories: [
        "computers-accessories-tablets",
        "computers-accessories-software"
      ],
      description: "Get 25% off on all tech products this summer",
      restrictions: "Valid for new customers only. Cannot be combined with other offers.",
      scope: "entire_store",
      coupon_code: "SUMMER25",
      coupon_code_discount_percentage: 25,
      coupon_code_discount_amount: 0,
      coupon_code_discount_currency_id: "USD",
      threshold_quantity: 0,
      threshold_amount: 100,
      threshold_amount_currency_id: "USD",
      purchase_limit_quantity: 0,
      purchase_limit_amount: 500,
      purchase_limit_amount_currency_id: "USD",
      date_valid_from: Date.now() / 1000 - 86400, // Yesterday
      date_valid_to: Date.now() / 1000 + 2592000, // 30 days from now
      date_valid_timezone_id: 80,
      has_products: true,
      has_locations: false,
      relationship: {
        deal_products: [
          {
            network_advertiser_deal_product_id: 1,
            network_advertiser_deal_id: 1,
            product_name: "Gaming Laptop",
            product_url: "https://example.com/gaming-laptop",
            before_discount_price: 1299,
            after_discount_price: 974,
            retail_price: 1399,
            discount_percentage: 25,
            price_currency_id: "USD"
          },
          {
            network_advertiser_deal_product_id: 2,
            network_advertiser_deal_id: 1,
            product_name: "Wireless Mouse",
            product_url: "https://example.com/wireless-mouse",
            before_discount_price: 79,
            after_discount_price: 59,
            retail_price: 89,
            discount_percentage: 25,
            price_currency_id: "USD"
          }
        ],
        offers: [
          {
            network_offer_id: 1,
            network_id: 1,
            name: "TechStore Affiliate Program",
            offer_status: "active",
            tracking_url: "https://tracking.example.com/click/1",
            redirect_tracking_url: "",
            impression_tracking_url: ""
          }
        ]
      },
      time_saved: Date.now() / 1000,
      time_created: Date.now() / 1000 - 86400,
      time_deleted: 0
    },
    {
      network_advertiser_deal_id: 2,
      network_id: 1,
      name: "Free Shipping Weekend",
      brand_name: "FashionHub",
      deal_type: "freeshipping",
      deal_status: "active",
      deal_categories: [
        "apparel-clothing-shoes"
      ],
      description: "Free shipping on all orders this weekend",
      restrictions: "Minimum order value $50",
      scope: "entire_store",
      coupon_code: "FREESHIP",
      coupon_code_discount_percentage: 0,
      coupon_code_discount_amount: 0,
      coupon_code_discount_currency_id: "USD",
      threshold_quantity: 0,
      threshold_amount: 50,
      threshold_amount_currency_id: "USD",
      purchase_limit_quantity: 0,
      purchase_limit_amount: 0,
      purchase_limit_amount_currency_id: "",
      date_valid_from: Date.now() / 1000,
      date_valid_to: Date.now() / 1000 + 172800, // 2 days from now
      date_valid_timezone_id: 80,
      has_products: false,
      has_locations: false,
      relationship: {
        offers: [
          {
            network_offer_id: 2,
            network_id: 1,
            name: "Fashion Hub Affiliate",
            offer_status: "active",
            tracking_url: "https://tracking.example.com/click/2",
            redirect_tracking_url: "",
            impression_tracking_url: ""
          }
        ]
      },
      time_saved: Date.now() / 1000,
      time_created: Date.now() / 1000 - 3600,
      time_deleted: 0
    },
    {
      network_advertiser_deal_id: 3,
      network_id: 1,
      name: "Buy 2 Get 1 Free",
      brand_name: "BookWorld",
      deal_type: "bogo",
      deal_status: "active",
      deal_categories: [
        "books-media-entertainment"
      ],
      description: "Buy any 2 books and get the 3rd one free",
      restrictions: "Applies to books under $30 only",
      scope: "category",
      coupon_code: "B2G1FREE",
      coupon_code_discount_percentage: 0,
      coupon_code_discount_amount: 0,
      coupon_code_discount_currency_id: "USD",
      threshold_quantity: 2,
      threshold_amount: 0,
      threshold_amount_currency_id: "",
      purchase_limit_quantity: 6,
      purchase_limit_amount: 0,
      purchase_limit_amount_currency_id: "",
      date_valid_from: Date.now() / 1000 - 172800, // 2 days ago
      date_valid_to: Date.now() / 1000 + 604800, // 7 days from now
      date_valid_timezone_id: 80,
      has_products: true,
      has_locations: true,
      relationship: {
        offers: [
          {
            network_offer_id: 3,
            network_id: 1,
            name: "BookWorld Partnership",
            offer_status: "active",
            tracking_url: "https://tracking.example.com/click/3",
            redirect_tracking_url: "",
            impression_tracking_url: ""
          }
        ]
      },
      time_saved: Date.now() / 1000,
      time_created: Date.now() / 1000 - 172800,
      time_deleted: 0
    }
  ]

  const result: DealsResponse = {
    deals: mockDeals,
    paging: {
      page: 1,
      page_size: 50,
      total_count: mockDeals.length
    }
  }

  return NextResponse.json({
    data: result,
    source: 'mock'
  })
}
