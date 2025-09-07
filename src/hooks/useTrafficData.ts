import { create } from 'zustand'

interface TrafficControl {
  network_traffic_control_id: number
  status: 'active' | 'inactive'
  is_apply_all_offers: boolean
  control_type: 'blacklist' | 'whitelist'
  date_valid_from: string
  date_valid_to: string
  comparison_method: string
  variables: any[]
  relationship: any
}

interface BlockedOfferSource {
  network_offer_id: number
  sub_id: string
  traffic_blocking_status: string
  time_created: number
  time_saved: number
  offer_name?: string
}

interface BlockedVariable {
  variable: string
  value: string
  operator: string
}

interface TrafficData {
  traffic_controls: TrafficControl[]
  blocked_sources: BlockedOfferSource[]
  blocked_variables: BlockedVariable[]
}

interface TrafficFilters {
  offer_id: string
  status: string
  control_type: string
  search: string
  time_period: string
}

interface TrafficState {
  data: TrafficData
  loading: boolean
  error: string | null
  filters: TrafficFilters
  source: string
  setFilters: (filters: Partial<TrafficFilters>) => void
  fetchTrafficData: () => Promise<void>
  clearError: () => void
}

export const useTrafficData = create<TrafficState>()((set, get) => ({
  data: {
    traffic_controls: [],
    blocked_sources: [],
    blocked_variables: []
  },
  loading: false,
  error: null,
  source: '',
  filters: {
    offer_id: 'all',
    status: 'all',
    control_type: 'all',
    search: '',
    time_period: '7d'
  },

  setFilters: (newFilters: Partial<TrafficFilters>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }
    set({ filters: updatedFilters })
    
    // Auto-fetch when filters change
    get().fetchTrafficData()
  },

  clearError: () => set({ error: null }),

  fetchTrafficData: async () => {
    const { filters } = get()
    set({ loading: true, error: null })

    try {
      const params = new URLSearchParams()
      
      if (filters.offer_id !== 'all') {
        params.append('network_offer_id', filters.offer_id)
      }

      if (filters.time_period !== 'all') {
        params.append('time_period', filters.time_period)
      }

      console.log('Fetching traffic data with params:', params.toString())

      const response = await fetch(`/api/everflow/traffic?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch traffic data: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Traffic data response:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      let data = result.data

      // Apply client-side filters
      if (filters.status !== 'all') {
        data.traffic_controls = data.traffic_controls.filter((tc: TrafficControl) => 
          tc.status === filters.status
        )
      }

      if (filters.control_type !== 'all') {
        data.traffic_controls = data.traffic_controls.filter((tc: TrafficControl) => 
          tc.control_type === filters.control_type
        )
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        data.traffic_controls = data.traffic_controls.filter((tc: TrafficControl) =>
          tc.relationship?.name?.toLowerCase().includes(searchLower) ||
          tc.relationship?.description?.toLowerCase().includes(searchLower) ||
          tc.variables.some((v: string) => v.toLowerCase().includes(searchLower))
        )
        
        data.blocked_sources = data.blocked_sources.filter((bs: BlockedOfferSource) =>
          bs.sub_id.toLowerCase().includes(searchLower) ||
          bs.offer_name?.toLowerCase().includes(searchLower)
        )

        data.blocked_variables = data.blocked_variables.filter((bv: BlockedVariable) =>
          bv.variable.toLowerCase().includes(searchLower) ||
          bv.value.toLowerCase().includes(searchLower)
        )
      }

      set({
        data,
        source: result.source || 'unknown',
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Error fetching traffic data:', error)
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch traffic data'
      })
    }
  }
}))
