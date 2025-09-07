import { create } from 'zustand'

interface AffiliateOffer {
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

interface AffiliateOffersFilters {
  category: string
  status: string
  visibility: string
  search: string
  type: 'all' | 'runnable'
}

interface AffiliateOffersState {
  offers: AffiliateOffer[]
  loading: boolean
  error: string | null
  filters: AffiliateOffersFilters
  total: number
  paging: any
  source: string
  setFilters: (filters: Partial<AffiliateOffersFilters>) => void
  fetchOffers: () => Promise<void>
  clearError: () => void
}

export const useAffiliateOffersData = create<AffiliateOffersState>()((set, get) => ({
  offers: [],
  loading: false,
  error: null,
  total: 0,
  paging: null,
  source: '',
  filters: {
    category: 'all',
    status: 'all',
    visibility: 'all',
    search: '',
    type: 'runnable'
  },

  setFilters: (newFilters: Partial<AffiliateOffersFilters>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }
    set({ filters: updatedFilters })
    
    // Auto-fetch when filters change
    get().fetchOffers()
  },

  clearError: () => set({ error: null }),

  fetchOffers: async () => {
    const { filters } = get()
    set({ loading: true, error: null })

    try {
      const params = new URLSearchParams()
      
      if (filters.category !== 'all') params.append('category', filters.category)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.visibility !== 'all') params.append('visibility', filters.visibility)
      if (filters.search) params.append('search', filters.search)
      if (filters.type) params.append('type', filters.type)

      console.log('Fetching affiliate offers with params:', params.toString())

      const response = await fetch(`/api/everflow/affiliate-offers?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch offers: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Affiliate offers response:', data)

      if (data.error) {
        throw new Error(data.error)
      }

      set({
        offers: data.offers || [],
        total: data.total || 0,
        paging: data.paging,
        source: data.source || 'unknown',
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Error fetching affiliate offers:', error)
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch offers'
      })
    }
  }
}))
