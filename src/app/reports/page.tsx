"use client"

import { useState, useEffect } from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  RefreshCw, Download, Calendar, TrendingUp, TrendingDown, 
  BarChart3, PieChart, Users, DollarSign, MousePointer, 
  Target, Eye, CreditCard, Filter, Search, Settings
} from "lucide-react"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart 
} from 'recharts'

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const COLUMN_OPTIONS = [
  { value: 'offer', label: 'Offer' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'advertiser', label: 'Advertiser' },
  { value: 'country', label: 'Country' },
  { value: 'device_type', label: 'Device Type' },
  { value: 'platform', label: 'Platform' },
  { value: 'browser', label: 'Browser' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'creative', label: 'Creative' }
]

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CAD', label: 'CAD' }
]

export default function ReportsPage() {
  const [reportingData, setReportingData] = useState<ReportingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  const [filters, setFilters] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
    currency: 'USD',
    timezone: '90',
    columns: ['offer', 'affiliate'],
    groupBy: 'offer'
  })

  useEffect(() => {
    fetchReportingData()
  }, [])

  const fetchReportingData = async () => {
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

      const tableResult = await tableResponse.json()
      const summaryResult = await summaryResponse.json()

      if (tableResult.success && summaryResult.success) {
        setReportingData({
          table: tableResult.data?.table || tableResult.data || [],
          summary: summaryResult.data?.summary || summaryResult.data || { metrics: {} }
        })
      } else {
        throw new Error('Invalid response from reporting API')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching reporting data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchReportingData()
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    fetchReportingData()
  }

  const handleExportCSV = async () => {
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
      } else {
        throw new Error('Failed to export data')
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatPercentage = (value: string | number) => {
    return `${value}%`
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!reportingData?.table) return { performance: [], revenue: [], conversion: [] }

    const performance = reportingData.table.map((row, index) => ({
      name: row.offer?.name || row.affiliate?.name || `Item ${index + 1}`,
      clicks: row.total_clicks,
      conversions: row.conversions,
      revenue: row.revenue,
      profit: row.profit
    }))

    const revenue = reportingData.table.map((row, index) => ({
      name: row.offer?.name || row.affiliate?.name || `Item ${index + 1}`,
      revenue: row.revenue,
      payout: row.payout,
      profit: row.profit
    }))

    const conversion = reportingData.table.slice(0, 6).map((row, index) => ({
      name: row.offer?.name || row.affiliate?.name || `Item ${index + 1}`,
      value: row.conversions,
      percentage: parseFloat(row.conversionRate)
    }))

    return { performance, revenue, conversion }
  }

  const chartData = prepareChartData()
  const metrics = reportingData?.summary?.metrics

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-auto p-6">
          <SignedOut>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Reporting Dashboard</h1>
              <p className="text-muted-foreground mb-6">Please sign in to access your reports</p>
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Reporting Dashboard</h1>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting using Everflow aggregated data reports
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Report Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">From Date</label>
                      <Input
                        type="date"
                        value={filters.from}
                        onChange={(e) => handleFilterChange('from', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">To Date</label>
                      <Input
                        type="date"
                        value={filters.to}
                        onChange={(e) => handleFilterChange('to', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Currency</label>
                      <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Group By</label>
                      <Select value={filters.groupBy} onValueChange={(value) => handleFilterChange('groupBy', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLUMN_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Timezone</label>
                      <Select value={filters.timezone} onValueChange={(value) => handleFilterChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">UTC</SelectItem>
                          <SelectItem value="67">Eastern Time</SelectItem>
                          <SelectItem value="80">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button onClick={handleApplyFilters} className="w-full">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Overview */}
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(metrics.revenue, filters.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Profit: {formatCurrency(metrics.profit, filters.currency)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {metrics.totalClicks.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unique: {metrics.uniqueClicks.toLocaleString()}
                          </p>
                        </div>
                        <MousePointer className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {metrics.conversions.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rate: {formatPercentage(metrics.conversionRate)}
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {metrics.impressions.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            CTR: {metrics.totalClicks > 0 && metrics.impressions > 0 
                              ? ((metrics.totalClicks / metrics.impressions) * 100).toFixed(2) 
                              : '0.00'}%
                          </p>
                        </div>
                        <Eye className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Data</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Performance Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData.performance.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="clicks" fill="#8884d8" name="Clicks" />
                            <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Conversion Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              dataKey="value"
                              data={chartData.conversion}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={(entry: any) => `${entry.name}: ${entry.value}`}
                            >
                              {chartData.conversion.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Click-to-Conversion Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData.performance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="clicks" stroke="#8884d8" name="Clicks" />
                          <Line type="monotone" dataKey="conversions" stroke="#82ca9d" name="Conversions" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue vs Profit Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData.revenue}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Revenue" />
                          <Area type="monotone" dataKey="payout" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Payout" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-6">
                  {/* Detailed Data Table */}
                  {reportingData?.table && reportingData.table.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Reporting Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Name</th>
                                <th className="text-right p-2">Clicks</th>
                                <th className="text-right p-2">Conversions</th>
                                <th className="text-right p-2">CVR</th>
                                <th className="text-right p-2">Revenue</th>
                                <th className="text-right p-2">Payout</th>
                                <th className="text-right p-2">Profit</th>
                                <th className="text-right p-2">EPC</th>
                                <th className="text-right p-2">RPC</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportingData.table.map((row, index) => (
                                <tr key={index} className="border-b hover:bg-muted/50">
                                  <td className="p-2 font-medium">
                                    {row.offer?.name || row.affiliate?.name || `Item ${index + 1}`}
                                  </td>
                                  <td className="p-2 text-right">{row.total_clicks.toLocaleString()}</td>
                                  <td className="p-2 text-right">{row.conversions.toLocaleString()}</td>
                                  <td className="p-2 text-right">{formatPercentage(row.conversionRate)}</td>
                                  <td className="p-2 text-right font-medium text-green-600">
                                    {formatCurrency(row.revenue, filters.currency)}
                                  </td>
                                  <td className="p-2 text-right">
                                    {formatCurrency(row.payout, filters.currency)}
                                  </td>
                                  <td className="p-2 text-right font-medium">
                                    {formatCurrency(row.profit, filters.currency)}
                                  </td>
                                  <td className="p-2 text-right">{formatCurrency(parseFloat(row.epc), filters.currency)}</td>
                                  <td className="p-2 text-right">{formatCurrency(parseFloat(row.rpc), filters.currency)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-red-800">{error}</p>
                      <Button variant="ghost" size="sm" onClick={handleRefresh}>
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading reporting data from Everflow API...</p>
                </div>
              )}

              {/* No Data State */}
              {!loading && !error && (!reportingData?.table || reportingData.table.length === 0) && (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reporting data available</h3>
                    <p className="text-muted-foreground mb-4">
                      No conversions found for the selected date range. Try:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Extending the date range</li>
                      <li>• Checking if you have conversions in your Everflow account</li>
                      <li>• Ensuring your API key has proper permissions</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </SignedIn>
        </main>
      </div>
    </div>
  )
}
