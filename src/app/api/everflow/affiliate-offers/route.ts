import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export interface EverflowAffiliateOffer {
  network_offer_id: number
  network_id: number
  name: string
  thumbnail_url: string
  network_category_id: number
  preview_url: string
  offer_status: 'active' | 'paused' | 'inactive'
  currency_id: string
  html_description: string
  visibility: 'public' | 'private'
  tracking_url: string
  time_created: number
  time_saved: number
  daily_conversion_cap: number
  weekly_conversion_cap: number
  monthly_conversion_cap: number
  global_conversion_cap: number
  daily_payout_cap: number
  weekly_payout_cap: number
  monthly_payout_cap: number
  global_payout_cap: number
  relationship?: {
    offer_affiliate_status: string
    category?: {
      network_category_id: number
      name: string
      status: string
    }
    payouts?: {
      total: number
      entries: Array<{
        network_offer_payout_revenue_id: number
        payout_type: string
        entry_name: string
        payout_amount: number
        payout_percentage: number
        is_default: boolean
      }>
    }
    ruleset?: {
      countries: string[]
      platforms: string[]
      device_types: string[]
      languages: string[]
    }
    reporting?: {
      imp: number
      total_click: number
      unique_click: number
      cv: number
      cvr: number
      revenue: number
    }
    creatives?: {
      total: number
      entries: Array<{
        network_offer_creative_id: number
        name: string
        creative_type: string
        resource_url: string
        width: number
        height: number
      }>
    }
    remaining_caps?: {
      remaining_daily_payout_cap: number
      remaining_daily_conversion_cap: number
      remaining_daily_click_cap: number
    }
  }
}

export interface NormalizedOffer {
  id: string
  name: string
  category: string
  description: string
  status: 'Active' | 'Paused' | 'Inactive'
  tracking_url: string
  thumbnail_url: string
  default_payout: number
  payout_type: string
  countries: string[]
  platforms: string[]
  device_types: string[]
  languages: string[]
  created_at: string
  updated_at: string
  caps: {
    daily_conversions: number
    weekly_conversions: number
    monthly_conversions: number
    global_conversions: number
    daily_payout: number
    remaining_daily_payout: number
    remaining_daily_conversions: number
  }
  performance: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    cvr: number
  }
  creatives_count: number
  visibility: string
  affiliate_status: string
}

// Normalize Everflow affiliate offer data to our format
function normalizeAffiliateOffer(everflowOffer: EverflowAffiliateOffer): NormalizedOffer {
  const defaultPayout = everflowOffer.relationship?.payouts?.entries?.find(p => p.is_default)
  const countries = everflowOffer.relationship?.ruleset?.countries || []
  const platforms = everflowOffer.relationship?.ruleset?.platforms || []
  const deviceTypes = everflowOffer.relationship?.ruleset?.device_types || []
  const languages = everflowOffer.relationship?.ruleset?.languages || []
  const reporting = everflowOffer.relationship?.reporting
  const remainingCaps = everflowOffer.relationship?.remaining_caps
  
  return {
    id: everflowOffer.network_offer_id.toString(),
    name: everflowOffer.name || 'Unnamed Offer',
    category: everflowOffer.relationship?.category?.name || 'General',
    description: everflowOffer.html_description?.replace(/<[^>]*>/g, '') || 'No description available',
    status: everflowOffer.offer_status === 'active' ? 'Active' : 
            everflowOffer.offer_status === 'paused' ? 'Paused' : 'Inactive',
    tracking_url: everflowOffer.tracking_url || '',
    thumbnail_url: everflowOffer.thumbnail_url || '',
    default_payout: defaultPayout?.payout_amount || 0,
    payout_type: defaultPayout?.payout_type || 'cpa',
    countries: countries,
    platforms: platforms,
    device_types: deviceTypes,
    languages: languages,
    created_at: new Date(everflowOffer.time_created * 1000).toISOString(),
    updated_at: new Date(everflowOffer.time_saved * 1000).toISOString(),
    caps: {
      daily_conversions: everflowOffer.daily_conversion_cap || 0,
      weekly_conversions: everflowOffer.weekly_conversion_cap || 0,
      monthly_conversions: everflowOffer.monthly_conversion_cap || 0,
      global_conversions: everflowOffer.global_conversion_cap || 0,
      daily_payout: everflowOffer.daily_payout_cap || 0,
      remaining_daily_payout: remainingCaps?.remaining_daily_payout_cap || 0,
      remaining_daily_conversions: remainingCaps?.remaining_daily_conversion_cap || 0
    },
    performance: {
      impressions: reporting?.imp || 0,
      clicks: reporting?.total_click || 0,
      conversions: reporting?.cv || 0,
      revenue: reporting?.revenue || 0,
      cvr: reporting?.cvr || 0
    },
    creatives_count: everflowOffer.relationship?.creatives?.total || 0,
    visibility: everflowOffer.visibility || 'public',
    affiliate_status: everflowOffer.relationship?.offer_affiliate_status || 'unknown'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const visibility = searchParams.get('visibility')
    const type = searchParams.get('type') || 'runnable' // 'all' or 'runnable'

    console.log('Affiliate API: Fetching offers with filters:', { category, status, search, visibility, type })

    const apiKey = process.env.EVERFLOW_API_KEY
    
    if (!apiKey) {
      console.warn('No Everflow API key found, using mock data')
      return getMockAffiliateOffersResponse(category, status, search, visibility)
    }

    try {
      // Choose the correct endpoint based on type
      const endpoint = type === 'runnable' ? 'offersrunnable' : 'alloffers'
      const everflowUrl = `https://api.eflow.team/v1/affiliates/${endpoint}`
      
      console.log('Calling Everflow Affiliate API:', everflowUrl)
      
      const response = await fetch(everflowUrl, {
        method: 'GET',
        headers: {
          'X-Eflow-API-Key': apiKey,
          'content-type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Everflow Affiliate API error:', response.status, response.statusText)
        return getMockAffiliateOffersResponse(category, status, search, visibility)
      }

      const data = await response.json()
      console.log('Everflow Affiliate API response structure:', {
        hasOffers: !!data.offers,
        offersCount: data.offers?.length || 0,
        hasPaging: !!data.paging,
        sampleOffer: data.offers?.[0] ? Object.keys(data.offers[0]) : []
      })

      if (!data.offers || !Array.isArray(data.offers)) {
        console.warn('Invalid Everflow Affiliate API response structure, using mock data')
        return getMockAffiliateOffersResponse(category, status, search, visibility)
      }

      // Normalize the offers
      let normalizedOffers = data.offers.map(normalizeAffiliateOffer)
      console.log('Normalized offers sample:', normalizedOffers[0])

      // Apply filters
      if (category && category !== 'all') {
        normalizedOffers = normalizedOffers.filter((offer: NormalizedOffer) => 
          offer.category.toLowerCase() === category.toLowerCase()
        )
      }

      if (status && status !== 'all') {
        normalizedOffers = normalizedOffers.filter((offer: NormalizedOffer) => 
          offer.status.toLowerCase() === status.toLowerCase()
        )
      }

      if (visibility && visibility !== 'all') {
        normalizedOffers = normalizedOffers.filter((offer: NormalizedOffer) => 
          offer.visibility.toLowerCase() === visibility.toLowerCase()
        )
      }

      if (search) {
        const searchLower = search.toLowerCase()
        normalizedOffers = normalizedOffers.filter((offer: NormalizedOffer) =>
          offer.name.toLowerCase().includes(searchLower) ||
          offer.description.toLowerCase().includes(searchLower) ||
          offer.category.toLowerCase().includes(searchLower)
        )
      }

      console.log('Affiliate API: Returning normalized offers:', normalizedOffers.length)

      return NextResponse.json({
        offers: normalizedOffers,
        total: normalizedOffers.length,
        paging: data.paging,
        source: 'everflow-affiliate',
        endpoint: endpoint
      })

    } catch (apiError) {
      console.error('Everflow Affiliate API call failed:', apiError)
      return getMockAffiliateOffersResponse(category, status, search, visibility)
    }

  } catch (error) {
    console.error('Error fetching affiliate offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch affiliate offers' },
      { status: 500 }
    )
  }
}

function getMockAffiliateOffersResponse(
  category: string | null, 
  status: string | null, 
  search: string | null,
  visibility: string | null
) {
  console.log('Using mock affiliate offers data')
  
  const mockOffers: NormalizedOffer[] = [
    {
      id: '1',
      name: 'Premium Finance Offer - CPA',
      category: 'Finance',
      description: 'High-converting finance offer with excellent payouts and proven conversion rates. Perfect for finance traffic.',
      status: 'Active',
      tracking_url: 'https://track.example.com/finance-offer',
      thumbnail_url: '',
      default_payout: 25.00,
      payout_type: 'cpa',
      countries: ['US', 'CA', 'UK'],
      platforms: ['desktop', 'mobile'],
      device_types: ['smartphone', 'tablet', 'desktop'],
      languages: ['en'],
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      caps: {
        daily_conversions: 100,
        weekly_conversions: 500,
        monthly_conversions: 2000,
        global_conversions: 10000,
        daily_payout: 2500,
        remaining_daily_payout: 1200,
        remaining_daily_conversions: 45
      },
      performance: {
        impressions: 15420,
        clicks: 1241,
        conversions: 89,
        revenue: 2225.00,
        cvr: 7.17
      },
      creatives_count: 5,
      visibility: 'public',
      affiliate_status: 'approved'
    },
    {
      id: '2', 
      name: 'Health & Wellness RevShare',
      category: 'Health',
      description: 'Top-performing health supplements campaign with revenue sharing model and excellent long-term value.',
      status: 'Active',
      tracking_url: 'https://track.example.com/health-offer',
      thumbnail_url: '',
      default_payout: 15.00,
      payout_type: 'revshare',
      countries: ['US', 'AU', 'NZ'],
      platforms: ['mobile', 'desktop'],
      device_types: ['smartphone', 'desktop'],
      languages: ['en'],
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      caps: {
        daily_conversions: 75,
        weekly_conversions: 350,
        monthly_conversions: 1500,
        global_conversions: 8000,
        daily_payout: 1125,
        remaining_daily_payout: 890,
        remaining_daily_conversions: 32
      },
      performance: {
        impressions: 9834,
        clicks: 876,
        conversions: 67,
        revenue: 1005.00,
        cvr: 7.65
      },
      creatives_count: 8,
      visibility: 'public',
      affiliate_status: 'approved'
    },
    {
      id: '3',
      name: 'Tech Gadgets CPL Campaign',
      category: 'Technology',
      description: 'Latest tech gadgets cost-per-lead campaign with high conversion rates and premium targeting options.',
      status: 'Paused',
      tracking_url: 'https://track.example.com/tech-offer',
      thumbnail_url: '',
      default_payout: 8.50,
      payout_type: 'cpl',
      countries: ['US', 'UK', 'DE', 'FR'],
      platforms: ['desktop', 'mobile'],
      device_types: ['smartphone', 'tablet', 'desktop'],
      languages: ['en', 'de', 'fr'],
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      caps: {
        daily_conversions: 200,
        weekly_conversions: 1000,
        monthly_conversions: 4000,
        global_conversions: 20000,
        daily_payout: 1700,
        remaining_daily_payout: 0,
        remaining_daily_conversions: 0
      },
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        cvr: 0
      },
      creatives_count: 12,
      visibility: 'private',
      affiliate_status: 'pending'
    },
    {
      id: '4',
      name: 'Travel Booking Commission',
      category: 'Travel',
      description: 'Global travel booking platform with commission-based payouts and worldwide coverage.',
      status: 'Active',
      tracking_url: 'https://track.example.com/travel-offer',
      thumbnail_url: '',
      default_payout: 12.75,
      payout_type: 'cpc',
      countries: ['US', 'UK', 'DE', 'IT', 'ES', 'FR'],
      platforms: ['desktop', 'mobile'],
      device_types: ['smartphone', 'tablet', 'desktop'],
      languages: ['en', 'de', 'fr', 'it', 'es'],
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      caps: {
        daily_conversions: 150,
        weekly_conversions: 750,
        monthly_conversions: 3000,
        global_conversions: 15000,
        daily_payout: 1912,
        remaining_daily_payout: 1456,
        remaining_daily_conversions: 89
      },
      performance: {
        impressions: 12567,
        clicks: 1456,
        conversions: 114,
        revenue: 1453.50,
        cvr: 7.83
      },
      creatives_count: 6,
      visibility: 'public',
      affiliate_status: 'approved'
    },
    {
      id: '5',
      name: 'Crypto Exchange CPA',
      category: 'Finance',
      description: 'Leading cryptocurrency exchange with high-value conversions and institutional-grade security.',
      status: 'Active',
      tracking_url: 'https://track.example.com/crypto-offer',
      thumbnail_url: '',
      default_payout: 45.00,
      payout_type: 'cpa',
      countries: ['US', 'UK', 'CA', 'AU'],
      platforms: ['desktop', 'mobile'],
      device_types: ['smartphone', 'desktop'],
      languages: ['en'],
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      caps: {
        daily_conversions: 50,
        weekly_conversions: 250,
        monthly_conversions: 1000,
        global_conversions: 5000,
        daily_payout: 2250,
        remaining_daily_payout: 1575,
        remaining_daily_conversions: 35
      },
      performance: {
        impressions: 8934,
        clicks: 645,
        conversions: 15,
        revenue: 675.00,
        cvr: 2.33
      },
      creatives_count: 3,
      visibility: 'public',
      affiliate_status: 'approved'
    }
  ]

  // Apply filters
  let filteredOffers = mockOffers

  if (category && category !== 'all') {
    filteredOffers = filteredOffers.filter(offer => 
      offer.category.toLowerCase() === category.toLowerCase()
    )
  }

  if (status && status !== 'all') {
    filteredOffers = filteredOffers.filter(offer => 
      offer.status.toLowerCase() === status.toLowerCase()
    )
  }

  if (visibility && visibility !== 'all') {
    filteredOffers = filteredOffers.filter(offer => 
      offer.visibility.toLowerCase() === visibility.toLowerCase()
    )
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredOffers = filteredOffers.filter(offer =>
      offer.name.toLowerCase().includes(searchLower) ||
      offer.description.toLowerCase().includes(searchLower) ||
      offer.category.toLowerCase().includes(searchLower)
    )
  }

  return NextResponse.json({
    offers: filteredOffers,
    total: filteredOffers.length,
    paging: {
      page: 1,
      page_size: 50,
      total_count: filteredOffers.length
    },
    source: 'mock-affiliate'
  })
}
