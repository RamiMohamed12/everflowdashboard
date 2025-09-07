import { useState, useCallback } from 'react'

interface ReportingFilters {
  from: string
  to: string
  currency: string
  timezone: string
  columns: string[]
  groupBy: string
}

interface ReportingMetrics {
  totalClicks: number
  uniqueClicks: number
  conversions: number
  conversionRate: string
  payout: number
  revenue: number
  profit: number
  grossSales: number
  impressions: number
  mediaBuyingCost: number
}

interface ReportingRow {
  offer?: { network_offer_id: number; name: string }
  affiliate?: { network_affiliate_id: number; name: string }
  advertiser?: { network_advertiser_id: number; name: string }
  total_clicks: number
  unique_clicks: number
  conversions: number
  payout: number
  revenue: number
  profit: number
  gross_sales: number
  impressions: number
  media_buying_cost: number
  conversionRate: string
  ctr: string
  epc: string
  rpc: string
}

interface ReportingData {
  table: ReportingRow[]
  summary: {
    metrics: ReportingMetrics
  }
}

interface ReportingResponse {
  success: boolean
  data: any
  usingMockData?: boolean
  error?: string
  timestamp: string
}

export function useReportingData() {
  const [data, setData] = useState<ReportingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReportingData = useCallback(async (filters: ReportingFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch both table and summary data
      const [tableResponse, summaryResponse] = await Promise.all([
        fetch('/api/everflow/reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...filters,
            timezone_id: parseInt(filters.timezone),
            currency_id: filters.currency,
            columns: filters.columns.map(col => ({ column: col })),
            endpoint: 'table'
          })
        }),
        fetch('/api/everflow/reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...filters,
            timezone_id: parseInt(filters.timezone),
            currency_id: filters.currency,
            columns: filters.columns.map(col => ({ column: col })),
            endpoint: 'summary'
          })
        })
      ])

      if (!tableResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch reporting data')
      }

      const tableResult: ReportingResponse = await tableResponse.json()
      const summaryResult: ReportingResponse = await summaryResponse.json()

      if (tableResult.success && summaryResult.success) {
        const reportingData: ReportingData = {
          table: tableResult.data?.table || tableResult.data || [],
          summary: summaryResult.data?.summary || summaryResult.data || { metrics: {} }
        }
        
        setData(reportingData)
        return reportingData
      } else {
        throw new Error('Invalid response from reporting API')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching reporting data:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const exportCSV = useCallback(async (filters: ReportingFilters) => {
    try {
      const response = await fetch('/api/everflow/reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filters,
          timezone_id: parseInt(filters.timezone),
          currency_id: filters.currency,
          columns: filters.columns.map(col => ({ column: col })),
          endpoint: 'export',
          format: 'csv'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporting-${filters.from}-to-${filters.to}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return true
      } else {
        throw new Error('Failed to export data')
      }
    } catch (error) {
      console.error('Export error:', error)
      setError(error instanceof Error ? error.message : 'Export failed')
      return false
    }
  }, [])

  const getReportingAdjustments = useCallback(async (from: string, to: string) => {
    try {
      const response = await fetch(`/api/everflow/reporting?from=${from}&to=${to}`, {
        method: 'GET'
      })

      if (response.ok) {
        const result: ReportingResponse = await response.json()
        return result.data
      } else {
        throw new Error('Failed to fetch reporting adjustments')
      }
    } catch (error) {
      console.error('Adjustments error:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch adjustments')
      return null
    }
  }, [])

  return {
    data,
    loading,
    error,
    fetchReportingData,
    exportCSV,
    getReportingAdjustments,
    setError
  }
}
