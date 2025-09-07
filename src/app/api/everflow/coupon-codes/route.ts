import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server";
import { everflowRequest } from "@/lib/everflow-api";

interface CouponCode {
  network_coupon_code_id: number
  network_id: number
  network_offer_id: number
  coupon_code: string
  coupon_status: string
  tracking_link: string
  start_date: string
  end_date: string
  description: string
  is_description_plain_text: boolean
  time_created: number
  time_saved: number
  relationship?: {
    offer: {
      network_offer_id: number
      network_id: number
      name: string
      offer_status: string
    }
  }
}

interface CouponCodesResponse {
  coupon_codes: CouponCode[]
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

    try {
      console.log('Fetching coupon codes from Everflow API')

      // Try different endpoints as coupon codes might not have a direct table endpoint
      let data: CouponCodesResponse;
      try {
        // First try couponcodestable
        data = await everflowRequest('couponcodestable', 'POST', {});
      } catch (error1) {
        try {
          // Try couponcodes
          data = await everflowRequest('couponcodes', 'GET');
        } catch (error2) {
          try {
            // Try offers endpoint which might contain coupon codes
            const offersData = await everflowRequest('offerstable', 'POST', {});
            // For now, return empty coupon codes array if offers endpoint works
            data = { coupon_codes: [] };
          } catch (error3) {
            throw error1; // Throw the original couponcodestable error
          }
        }
      }
      console.log('Everflow coupon codes API response:', data)

      return NextResponse.json({
        data: data,
        source: 'everflow-api'
      })

    } catch (apiError) {
      console.error('Error calling Everflow API:', apiError)
      return getMockCouponCodesData()
    }

  } catch (error) {
    console.error('Error in coupon codes API route:', error)
    return getMockCouponCodesData()
  }
}

function getMockCouponCodesData() {
  console.log('Using mock coupon codes data')

  const mockCouponCodes: CouponCode[] = [
    {
      network_coupon_code_id: 132,
      network_id: 1,
      network_offer_id: 16,
      coupon_code: "WINTER25",
      coupon_status: "active",
      tracking_link: "https://tracking.example.com/coupon/WINTER25/",
      start_date: "2025-01-01",
      end_date: "2025-06-01",
      description: "25% off on all winter jackets",
      is_description_plain_text: true,
      time_created: 1585177030,
      time_saved: 1737590006,
      relationship: {
        offer: {
          network_offer_id: 16,
          network_id: 1,
          name: "Winter Jackets",
          offer_status: "active"
        }
      }
    },
    {
      network_coupon_code_id: 152,
      network_id: 1,
      network_offer_id: 18,
      coupon_code: "PANTS35",
      coupon_status: "active",
      tracking_link: "https://tracking.example.com/coupon/PANTS35/",
      start_date: "",
      end_date: "",
      description: "35$ off on <strong>dress pants</strong> at all times",
      is_description_plain_text: false,
      time_created: 1586909228,
      time_saved: 1586909228,
      relationship: {
        offer: {
          network_offer_id: 18,
          network_id: 1,
          name: "Dress Pants",
          offer_status: "active"
        }
      }
    },
    {
      network_coupon_code_id: 167,
      network_id: 1,
      network_offer_id: 22,
      coupon_code: "FREESHIP50",
      coupon_status: "active",
      tracking_link: "https://tracking.example.com/coupon/FREESHIP50/",
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      description: "Free shipping on orders over $50",
      is_description_plain_text: true,
      time_created: 1640995200,
      time_saved: 1737590006,
      relationship: {
        offer: {
          network_offer_id: 22,
          network_id: 1,
          name: "Fashion Store",
          offer_status: "active"
        }
      }
    },
    {
      network_coupon_code_id: 189,
      network_id: 1,
      network_offer_id: 25,
      coupon_code: "TECH15",
      coupon_status: "active",
      tracking_link: "https://tracking.example.com/coupon/TECH15/",
      start_date: "2025-09-01",
      end_date: "2025-09-30",
      description: "15% discount on all <em>tech gadgets</em> and accessories",
      is_description_plain_text: false,
      time_created: 1693516800,
      time_saved: 1737590006,
      relationship: {
        offer: {
          network_offer_id: 25,
          network_id: 1,
          name: "Tech Gadgets Pro",
          offer_status: "active"
        }
      }
    },
    {
      network_coupon_code_id: 201,
      network_id: 1,
      network_offer_id: 28,
      coupon_code: "NEWUSER20",
      coupon_status: "active",
      tracking_link: "https://tracking.example.com/coupon/NEWUSER20/",
      start_date: "",
      end_date: "",
      description: "20% off for new customers on their first purchase",
      is_description_plain_text: true,
      time_created: 1704067200,
      time_saved: 1737590006,
      relationship: {
        offer: {
          network_offer_id: 28,
          network_id: 1,
          name: "Online Marketplace",
          offer_status: "active"
        }
      }
    }
  ]

  const result: CouponCodesResponse = {
    coupon_codes: mockCouponCodes
  }

  return NextResponse.json({
    data: result,
    source: 'mock'
  })
}
