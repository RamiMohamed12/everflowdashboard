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
import { RefreshCw, Download, Search, Users, DollarSign, TrendingUp, Calendar, Filter, BarChart3, PieChart, User, CheckCircle, XCircle, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'

interface Affiliate {
  network_affiliate_id: number
  name: string
  account_status: string
  account_manager_id: number
  account_manager_name: string
  today_revenue: string
  time_created: number
  time_saved: number
  labels: string[]
  balance: number
  last_login: number
  is_payable: boolean
  payment_type: string
  today_revenue_amount?: number
  last_login_date?: Date | null
  created_date?: Date
  updated_date?: Date
}

interface AffiliatesResponse {
  success: boolean
  data: Affiliate[]
  paging?: {
    page: number
    page_size: number
    total_count: number
  }
  timestamp: string
  usingMockData?: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    manager: "",
    payment_type: ""
  })

  // Load data on component mount
  useEffect(() => {
    fetchAffiliates()
  }, [])

  const fetchAffiliates = async (filterOverrides = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const requestFilters = { ...filters, ...filterOverrides }
      
      const response = await fetch('/api/everflow/affiliates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          page_size: 100,
          search: requestFilters.search || '',
          filters: Object.entries(requestFilters)
            .filter(([key, value]) => key !== 'search' && value)
            .map(([key, value]) => ({ [key]: value }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: AffiliatesResponse = await response.json()
      
      if (result.success) {
        const affiliatesData = result.data || []
        setAffiliates(affiliatesData)
      } else {
        throw new Error('Failed to fetch affiliates data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching affiliates:', err)
      setAffiliates([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchAffiliates()
  }

  const handleSearch = () => {
    const newFilters = { ...filters, search: searchInput }
    setFilters(newFilters)
    fetchAffiliates(newFilters)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? '' : value }
    setFilters(newFilters)
    fetchAffiliates(newFilters)
  }

  const handleExportCSV = () => {
    try {
      const headers = [
        'Affiliate ID', 'Name', 'Status', 'Account Manager', 'Today Revenue', 'Balance', 
        'Payment Type', 'Labels', 'Last Login', 'Created Date', 'Updated Date', 'Is Payable'
      ]
      
      const csvData = affiliates.map(affiliate => [
        affiliate.network_affiliate_id,
        affiliate.name,
        affiliate.account_status,
        affiliate.account_manager_name,
        affiliate.today_revenue,
        affiliate.balance,
        affiliate.payment_type,
        affiliate.labels.join('; '),
        affiliate.last_login ? new Date(affiliate.last_login * 1000).toLocaleDateString() : 'Never',
        new Date(affiliate.time_created * 1000).toLocaleDateString(),
        new Date(affiliate.time_saved * 1000).toLocaleDateString(),
        affiliate.is_payable ? 'Yes' : 'No'
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
      link.setAttribute('download', `affiliates-${format(new Date(), 'yyyy-MM-dd')}.csv`)
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

  const getPaymentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wire': return 'bg-blue-100 text-blue-800'
      case 'paypal': return 'bg-purple-100 text-purple-800'
      case 'check': return 'bg-orange-100 text-orange-800'
      case 'none': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats
  const stats = {
    total: affiliates.length,
    active: affiliates.filter(a => a.account_status === 'active').length,
    inactive: affiliates.filter(a => a.account_status === 'inactive').length,
    totalRevenue: affiliates.reduce((sum, a) => sum + (a.today_revenue_amount || parseFloat(a.today_revenue?.replace(/[$,]/g, '') || '0')), 0),
    totalBalance: affiliates.reduce((sum, a) => sum + a.balance, 0),
    payable: affiliates.filter(a => a.is_payable).length
  }

  // Prepare chart data
  const statusChartData = [
    { name: 'Active', value: stats.active, color: '#10B981' },
    { name: 'Inactive', value: stats.inactive, color: '#EF4444' },
    { name: 'Suspended', value: affiliates.filter(a => a.account_status === 'suspended').length, color: '#F59E0B' }
  ].filter(item => item.value > 0)

  const managerChartData = affiliates.reduce((acc: any[], affiliate) => {
    const existing = acc.find(item => item.name === affiliate.account_manager_name)
    if (existing) {
      existing.count += 1
      existing.revenue += affiliate.today_revenue_amount || parseFloat(affiliate.today_revenue?.replace(/[$,]/g, '') || '0')
    } else {
      acc.push({
        name: affiliate.account_manager_name,
        count: 1,
        revenue: affiliate.today_revenue_amount || parseFloat(affiliate.today_revenue?.replace(/[$,]/g, '') || '0')
      })
    }
    return acc
  }, [])

  const paymentTypeData = affiliates.reduce((acc: any[], affiliate) => {
    const existing = acc.find(item => item.name === affiliate.payment_type)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({
        name: affiliate.payment_type,
        value: 1
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
              <h1 className="text-2xl font-bold mb-4">Affiliates Dashboard</h1>
              <p className="text-muted-foreground mb-6">Please sign in to access your affiliates</p>
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
                  <h1 className="text-3xl font-bold">Affiliates Management</h1>
                  <p className="text-muted-foreground">
                    Manage and track your affiliate partners using the Everflow Networks API
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search affiliates..."
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
                      value={filters.payment_type || 'all'} 
                      onValueChange={(value) => handleFilterChange('payment_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Payment Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payment Types</SelectItem>
                        <SelectItem value="wire">Wire Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.manager || 'all'} 
                      onValueChange={(value) => handleFilterChange('manager', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Managers</SelectItem>
                        {Array.from(new Set(affiliates.map(a => a.account_manager_name))).map(manager => (
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
                        <p className="text-sm font-medium text-muted-foreground">Total Affiliates</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Affiliates</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                        <p className="text-2xl font-bold text-purple-600">${stats.totalBalance.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.payable} payable
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
                      Affiliate Status Distribution
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
                      Affiliates by Account Manager
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
                  <p className="mt-4 text-muted-foreground">Loading affiliates from Everflow API...</p>
                </div>
              )}

              {/* No affiliates found */}
              {!loading && affiliates.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No affiliates found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                  </CardContent>
                </Card>
              )}

              {/* Affiliates List */}
              {!loading && affiliates.length > 0 && (
                <div className="grid gap-4">
                  {affiliates.map((affiliate) => (
                    <Card key={affiliate.network_affiliate_id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{affiliate.name}</h3>
                              <Badge className={getStatusColor(affiliate.account_status)}>
                                {affiliate.account_status}
                              </Badge>
                              <Badge className={getPaymentTypeColor(affiliate.payment_type)}>
                                {affiliate.payment_type}
                              </Badge>
                              {affiliate.is_payable && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Payable
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>ID: {affiliate.network_affiliate_id}</span>
                              <span>•</span>
                              <span>Manager: {affiliate.account_manager_name}</span>
                              <span>•</span>
                              <span>
                                Last Login: {affiliate.last_login 
                                  ? new Date(affiliate.last_login * 1000).toLocaleDateString()
                                  : 'Never'
                                }
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {affiliate.labels.map((label) => (
                                <Badge key={label} variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {affiliate.today_revenue}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Today's Revenue
                            </div>
                            <div className="text-sm font-medium text-blue-600 mt-1">
                              Balance: ${affiliate.balance.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-sm">
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <span className="ml-1 font-medium">
                              {new Date(affiliate.time_created * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated:</span>
                            <span className="ml-1 font-medium">
                              {new Date(affiliate.time_saved * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payment:</span>
                            <span className="ml-1 font-medium capitalize">
                              {affiliate.payment_type}
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
