"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Search, Megaphone, DollarSign, TrendingUp, Calendar, Filter, BarChart3, PieChart, User, CheckCircle, XCircle, Clock, Building2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'

interface Advertiser {
  network_advertiser_id: number
  name: string
  account_status: string
  account_manager_id: number
  account_manager_name: string
  sales_manager_id: number
  sales_manager_name: string
  today_revenue: string
  time_created: number
  time_saved: number
  labels: string[]
  verification_token: string
  today_revenue_amount?: number
  created_date?: Date
  updated_date?: Date
}

interface AdvertisersResponse {
  success: boolean
  data: Advertiser[]
  paging?: {
    page: number
    page_size: number
    total_count: number
  }
  timestamp: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    manager: "",
    sales_manager: ""
  })

  // Load data on component mount
  useEffect(() => {
    fetchAdvertisers()
  }, [])

  const fetchAdvertisers = async (filterOverrides = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const requestFilters = { ...filters, ...filterOverrides }
      
      const response = await fetch('/api/everflow/advertisers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          page_size: 100,
          search_terms: requestFilters.search ? [{ field: "name", value: requestFilters.search }] : [],
          filters: Object.entries(requestFilters)
            .filter(([key, value]) => key !== 'search' && value)
            .map(([key, value]) => ({ field: key, value }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: AdvertisersResponse = await response.json()
      
      if (result.success) {
        const advertisersData = result.data || []
        setAdvertisers(advertisersData)
      } else {
        throw new Error('Failed to fetch advertisers data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching advertisers:', err)
      setAdvertisers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchAdvertisers()
  }

  const handleSearch = () => {
    const newFilters = { ...filters, search: searchInput }
    setFilters(newFilters)
    fetchAdvertisers(newFilters)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? '' : value }
    setFilters(newFilters)
    fetchAdvertisers(newFilters)
  }

  const handleExportCSV = () => {
    try {
      const headers = [
        'Advertiser ID', 'Name', 'Status', 'Account Manager', 'Sales Manager', 'Today Revenue', 
        'Labels', 'Verification Token', 'Created Date', 'Updated Date'
      ]
      
      const csvData = advertisers.map(advertiser => [
        advertiser.network_advertiser_id,
        advertiser.name,
        advertiser.account_status,
        advertiser.account_manager_name,
        advertiser.sales_manager_name,
        advertiser.today_revenue,
        (advertiser.labels || []).join('; '),
        advertiser.verification_token,
        new Date(advertiser.time_created * 1000).toLocaleDateString(),
        new Date(advertiser.time_saved * 1000).toLocaleDateString()
      ])

      const csvContent = [headers, ...csvData]
        .map(row => row.map((cell: any) => {
          const cellStr = String(cell || '')
          return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') 
            ? `"${cellStr.replace(/"/g, '""')}"` 
            : cellStr
        }).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `advertisers-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats
  const stats = {
    total: advertisers.length,
    active: advertisers.filter(a => a.account_status === 'active').length,
    inactive: advertisers.filter(a => a.account_status === 'inactive').length,
    totalRevenue: advertisers.reduce((sum, a) => sum + (a.today_revenue_amount || parseFloat(a.today_revenue?.replace(/[$,]/g, '') || '0')), 0),
    withTokens: advertisers.filter(a => a.verification_token).length
  }

  // Prepare chart data
  const statusChartData = [
    { name: 'Active', value: stats.active, color: '#10B981' },
    { name: 'Inactive', value: stats.inactive, color: '#EF4444' },
    { name: 'Suspended', value: advertisers.filter(a => a.account_status === 'suspended').length, color: '#F59E0B' }
  ].filter(item => item.value > 0)

  const managerChartData = advertisers.reduce((acc: any[], advertiser) => {
    const existing = acc.find(item => item.name === advertiser.account_manager_name)
    if (existing) {
      existing.count += 1
      existing.revenue += advertiser.today_revenue_amount || parseFloat(advertiser.today_revenue?.replace(/[$,]/g, '') || '0')
    } else {
      acc.push({
        name: advertiser.account_manager_name,
        count: 1,
        revenue: advertiser.today_revenue_amount || parseFloat(advertiser.today_revenue?.replace(/[$,]/g, '') || '0')
      })
    }
    return acc
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-auto p-6">
          <SignedOut>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Advertisers Dashboard</h1>
              <p className="text-muted-foreground mb-6">Please sign in to access your advertisers</p>
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
                  <h1 className="text-3xl font-bold">Advertisers Management</h1>
                  <p className="text-muted-foreground">
                    Manage and track your advertiser partners using the Everflow Advertisers API
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRefresh} 
                    variant="outline" 
                    size="sm"
                    disabled={loading}
                  >
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
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search advertisers..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} size="sm">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Select 
                      value={filters.status || 'all'} 
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.manager || 'all'} 
                      onValueChange={(value) => handleFilterChange('manager', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Account Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Managers</SelectItem>
                        {Array.from(new Set(advertisers.map(a => a.account_manager_name))).map(manager => (
                          <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Advertisers</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Advertisers</p>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg: ${stats.total > 0 ? (stats.totalRevenue / stats.total).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">With Verification</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.withTokens}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.total > 0 ? Math.round((stats.withTokens / stats.total) * 100) : 0}% secured
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Advertiser Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry: any) => `${entry.name}: ${entry.value}`}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Advertisers by Account Manager
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={managerChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

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
                  <p className="mt-4 text-muted-foreground">Loading advertisers from Everflow API...</p>
                </div>
              )}

              {/* No advertisers found */}
              {!loading && advertisers.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No advertisers found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                  </CardContent>
                </Card>
              )}

              {/* Advertisers List */}
              {!loading && advertisers.length > 0 && (
                <div className="grid gap-4">
                  {advertisers.map((advertiser) => (
                    <Card key={advertiser.network_advertiser_id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{advertiser.name}</h3>
                              <Badge className={getStatusColor(advertiser.account_status)}>
                                {advertiser.account_status}
                              </Badge>
                              {advertiser.verification_token && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>ID: {advertiser.network_advertiser_id}</span>
                              <span>•</span>
                              <span>Account Manager: {advertiser.account_manager_name}</span>
                              {advertiser.sales_manager_name && (
                                <>
                                  <span>•</span>
                                  <span>Sales Manager: {advertiser.sales_manager_name}</span>
                                </>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {(advertiser.labels || []).map((label) => (
                                <Badge key={label} variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {advertiser.today_revenue}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Today's Revenue
                            </div>
                            {advertiser.verification_token && (
                              <div className="text-xs font-mono text-blue-600 mt-1 max-w-32 truncate">
                                Token: {advertiser.verification_token}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-sm">
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <span className="ml-1 font-medium">
                              {new Date(advertiser.time_created * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated:</span>
                            <span className="ml-1 font-medium">
                              {new Date(advertiser.time_saved * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-1 font-medium capitalize">
                              {advertiser.account_status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </SignedIn>
        </main>
      </div>
    </div>
  )
}
