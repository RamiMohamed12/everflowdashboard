import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export interface TrafficControl {
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

export interface BlockedOfferSource {
  network_offer_id: number
  sub_id: string
  traffic_blocking_status: string
  time_created: number
  time_saved: number
  offer_name?: string
}

export interface BlockedVariable {
  variable: string
  value: string
  operator: string
}

export interface TrafficData {
  traffic_controls: TrafficControl[]
  blocked_sources: BlockedOfferSource[]
  blocked_variables: BlockedVariable[]
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const network_offer_id = searchParams.get('network_offer_id')

    console.log('Traffic API: Fetching traffic data for offer:', network_offer_id)

    const apiKey = process.env.EVERFLOW_API_KEY
    
    if (!apiKey) {
      console.warn('No Everflow API key found, using mock data')
      return getMockTrafficData(network_offer_id)
    }

    try {
      // Fetch all traffic data in parallel
      const [trafficControlsRes, blockedSourcesRes] = await Promise.all([
        fetch('https://api.eflow.team/v1/affiliates/trafficcontrols', {
          headers: {
            'X-Eflow-API-Key': apiKey,
            'content-type': 'application/json'
          }
        }),
        fetch('https://api.eflow.team/v1/affiliates/trafficblocking', {
          headers: {
            'X-Eflow-API-Key': apiKey,
            'content-type': 'application/json'
          }
        })
      ])

      if (!trafficControlsRes.ok || !blockedSourcesRes.ok) {
        console.error('Everflow Traffic API error')
        return getMockTrafficData(network_offer_id)
      }

      const [trafficControlsData, blockedSourcesData] = await Promise.all([
        trafficControlsRes.json(),
        blockedSourcesRes.json()
      ])

      // Fetch blocked variables if offer ID is provided
      let blockedVariablesData: any = { variables: [] }
      if (network_offer_id) {
        try {
          const blockedVarsRes = await fetch('https://api.eflow.team/v1/affiliates/blockedvariables', {
            method: 'POST',
            headers: {
              'X-Eflow-API-Key': apiKey,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              network_offer_id: parseInt(network_offer_id),
              timezone_id: 90,
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
              to: new Date().toISOString().split('T')[0]
            })
          })
          
          if (blockedVarsRes.ok) {
            blockedVariablesData = await blockedVarsRes.json()
          }
        } catch (error) {
          console.warn('Failed to fetch blocked variables:', error)
        }
      }

      const trafficData: TrafficData = {
        traffic_controls: trafficControlsData.traffic_controls || [],
        blocked_sources: blockedSourcesData.blocked_sources || [],
        blocked_variables: blockedVariablesData.variables || []
      }

      console.log('Traffic API: Returning real data')

      return NextResponse.json({
        success: true,
        data: trafficData,
        source: 'everflow',
        timestamp: new Date().toISOString()
      })

    } catch (apiError) {
      console.error('Everflow Traffic API call failed:', apiError)
      return getMockTrafficData(network_offer_id)
    }

  } catch (error) {
    console.error('Error fetching traffic data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch traffic data' },
      { status: 500 }
    )
  }
}

function getMockTrafficData(network_offer_id: string | null) {
  console.log('Using mock traffic data')
  
  const mockData: TrafficData = {
    traffic_controls: [
      {
        network_traffic_control_id: 1,
        status: 'active',
        is_apply_all_offers: true,
        control_type: 'blacklist',
        date_valid_from: '',
        date_valid_to: '',
        comparison_method: 'contains',
        variables: ['source_id', 'sub_id'],
        relationship: {
          name: 'Block Spam Traffic',
          description: 'Blocks suspicious traffic sources'
        }
      },
      {
        network_traffic_control_id: 2,
        status: 'active',
        is_apply_all_offers: false,
        control_type: 'blacklist',
        date_valid_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        date_valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        comparison_method: 'exact',
        variables: ['country'],
        relationship: {
          name: 'Geo Restrictions',
          description: 'Blocks traffic from restricted countries'
        }
      },
      {
        network_traffic_control_id: 3,
        status: 'inactive',
        is_apply_all_offers: false,
        control_type: 'whitelist',
        date_valid_from: '',
        date_valid_to: '',
        comparison_method: 'regex',
        variables: ['user_agent'],
        relationship: {
          name: 'Mobile Only',
          description: 'Only allows mobile traffic'
        }
      }
    ],
    blocked_sources: [
      {
        network_offer_id: 1,
        sub_id: 'spam_source_123',
        traffic_blocking_status: 'blocked',
        time_created: Date.now() - 3 * 24 * 60 * 60 * 1000,
        time_saved: Date.now() - 3 * 24 * 60 * 60 * 1000,
        offer_name: 'Premium Finance Offer'
      },
      {
        network_offer_id: 2,
        sub_id: 'low_quality_456',
        traffic_blocking_status: 'blocked',
        time_created: Date.now() - 7 * 24 * 60 * 60 * 1000,
        time_saved: Date.now() - 2 * 24 * 60 * 60 * 1000,
        offer_name: 'Health & Wellness CPA'
      },
      {
        network_offer_id: 1,
        sub_id: 'bot_traffic_789',
        traffic_blocking_status: 'blocked',
        time_created: Date.now() - 1 * 24 * 60 * 60 * 1000,
        time_saved: Date.now() - 1 * 24 * 60 * 60 * 1000,
        offer_name: 'Premium Finance Offer'
      }
    ],
    blocked_variables: [
      {
        variable: 'source_id',
        value: 'spam123',
        operator: 'contains'
      },
      {
        variable: 'country',
        value: 'XX',
        operator: 'exact'
      },
      {
        variable: 'user_agent',
        value: 'bot',
        operator: 'contains'
      },
      {
        variable: 'ip_address',
        value: '192.168.1.100',
        operator: 'exact'
      }
    ]
  }

  return NextResponse.json({
    success: true,
    data: mockData,
    source: 'mock',
    timestamp: new Date().toISOString()
  })
}
