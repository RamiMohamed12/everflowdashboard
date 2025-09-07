"use client"

import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { 
  Search, 
  Download, 
  ExternalLink, 
  Gift, 
  Tag, 
  Calendar,
  DollarSign,
  Package,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

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
  threshold_amount: number
  threshold_amount_currency_id: string
  purchase_limit_amount: number
  purchase_limit_amount_currency_id: string
  date_valid_from: number
  date_valid_to: number
  has_products?: boolean
  has_locations?: boolean
  relationship?: {
    offers?: any[]
    deal_products?: any[]
  }
  time_saved: number
  time_created: number
}

interface DealsData {
  deals: Deal[]
  paging?: {
    page: number
    page_size: number
    total_count: number
  }
}

const DealsPage = () => {
  const [data, setData] = useState<DealsData>({ deals: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    deal_type: 'all',
    deal_status: 'all',
    scope: 'all'
  })

  const fetchDeals = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Fetching deals with filters:', filters)

      const response = await fetch('/api/everflow/deals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch deals: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Deals response:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      let filteredDeals = result.data.deals || []

      // Apply client-side filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredDeals = filteredDeals.filter((deal: Deal) =>
          deal.name.toLowerCase().includes(searchLower) ||
          deal.brand_name.toLowerCase().includes(searchLower) ||
          deal.description.toLowerCase().includes(searchLower) ||
          deal.coupon_code.toLowerCase().includes(searchLower)
        )
      }

      if (filters.deal_type !== 'all') {
        filteredDeals = filteredDeals.filter((deal: Deal) => deal.deal_type === filters.deal_type)
      }

      if (filters.deal_status !== 'all') {
        filteredDeals = filteredDeals.filter((deal: Deal) => deal.deal_status === filters.deal_status)
      }

      if (filters.scope !== 'all') {
        filteredDeals = filteredDeals.filter((deal: Deal) => deal.scope === filters.scope)
      }

      setData({
        deals: filteredDeals,
        paging: result.data.paging
      })
      setSource(result.source || 'unknown')
      setLoading(false)

    } catch (error) {
      console.error('Error fetching deals:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch deals')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeals()
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.deal_type, filters.deal_status, filters.scope])

  const handleRefresh = () => {
    setError(null)
    fetchDeals()
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return 'No expiry'
    try {
      const date = new Date(timestamp * 1000)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    } catch {
      return 'Invalid Date'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (!amount || amount === 0) return '-'
    return `${currency} ${amount.toFixed(2)}`
  }

  const formatDiscount = (percentage: number, amount: number, currency: string) => {
    if (percentage > 0) return `${percentage}%`
    if (amount > 0) return `${currency} ${amount}`
    return 'N/A'
  }

  const getDealTypeBadge = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'coupon': 'bg-blue-100 text-blue-800',
      'freeshipping': 'bg-green-100 text-green-800',
      'bogo': 'bg-purple-100 text-purple-800',
      'sale': 'bg-red-100 text-red-800',
      'clearance': 'bg-orange-100 text-orange-800',
      'rebates': 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Inactive</Badge>
      case 'deleted':
        return <Badge variant="destructive">Deleted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const exportToCSV = () => {
    if (data.deals.length === 0) return

    const headers = [
      'ID', 'Name', 'Brand', 'Type', 'Status', 'Scope', 'Coupon Code',
      'Discount', 'Threshold', 'Purchase Limit', 'Valid From', 'Valid To',
      'Description', 'Restrictions', 'Categories'
    ]

    const csvContent = [
      headers.join(','),
      ...data.deals.map(deal => [
        deal.network_advertiser_deal_id,
        `"${deal.name}"`,
        `"${deal.brand_name}"`,
        deal.deal_type,
        deal.deal_status,
        deal.scope,
        deal.coupon_code,
        `"${formatDiscount(deal.coupon_code_discount_percentage, deal.coupon_code_discount_amount, deal.coupon_code_discount_currency_id)}"`,
        `"${formatCurrency(deal.threshold_amount, deal.threshold_amount_currency_id)}"`,
        `"${formatCurrency(deal.purchase_limit_amount, deal.purchase_limit_amount_currency_id)}"`,
        `"${formatDate(deal.date_valid_from)}"`,
        `"${formatDate(deal.date_valid_to)}"`,
        `"${deal.description.replace(/"/g, '""')}"`,
        `"${deal.restrictions.replace(/"/g, '""')}"`,
        `"${deal.deal_categories.join('; ')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `deals_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const statsCards = [
    {
      title: "Total Deals",
      value: data.deals.length,
      icon: <Gift className="h-6 w-6 text-blue-600" />,
      color: "text-blue-600"
    },
    {
      title: "Active Deals",
      value: data.deals.filter(deal => deal.deal_status === 'active').length,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      color: "text-green-600"
    },
    {
      title: "With Coupons",
      value: data.deals.filter(deal => deal.coupon_code && deal.coupon_code !== '').length,
      icon: <Tag className="h-6 w-6 text-purple-600" />,
      color: "text-purple-600"
    },
    {
      title: "Brands",
      value: new Set(data.deals.map(deal => deal.brand_name)).size,
      icon: <Package className="h-6 w-6 text-orange-600" />,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-auto p-6">
          <SignedOut>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Deals Management</h1>
              <p className="text-muted-foreground mb-6">Please sign in to access deals management</p>
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
                  <h1 className="text-3xl font-bold">Deals Management</h1>
                  <p className="text-muted-foreground">
                    Manage and monitor all available deals and promotions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRefresh}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button 
                    onClick={exportToCSV}
                    disabled={data.deals.length === 0}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-red-800">{error}</p>
                      <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                        {stat.icon}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search deals, brands, coupons..."
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                        <Button onClick={() => {}} size="sm">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Select value={filters.deal_type} onValueChange={(value) => setFilters({ ...filters, deal_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Deal Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="coupon">Coupon</SelectItem>
                        <SelectItem value="freeshipping">Free Shipping</SelectItem>
                        <SelectItem value="bogo">Buy One Get One</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="clearance">Clearance</SelectItem>
                        <SelectItem value="rebates">Rebates</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.deal_status} onValueChange={(value) => setFilters({ ...filters, deal_status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.scope} onValueChange={(value) => setFilters({ ...filters, scope: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scopes</SelectItem>
                        <SelectItem value="entire_store">Entire Store</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading deals from Everflow API...</p>
                </div>
              )}

              {/* No deals found */}
              {!loading && data.deals.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deals found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                  </CardContent>
                </Card>
              )}

              {/* Deals Grid */}
              {!loading && data.deals.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Deals ({data.deals.length})</h2>
                  </div>
                  
                  <div className="grid gap-4">
                    {data.deals.map((deal) => (
                      <Card key={deal.network_advertiser_deal_id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{deal.name}</h3>
                                {getStatusBadge(deal.deal_status)}
                                {getDealTypeBadge(deal.deal_type)}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span>ID: {deal.network_advertiser_deal_id}</span>
                                <span>•</span>
                                <span>Brand: {deal.brand_name}</span>
                                <span>•</span>
                                <span>Scope: {deal.scope}</span>
                              </div>

                              <p className="text-sm text-muted-foreground">{deal.description}</p>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600 mb-1">
                                {formatDiscount(
                                  deal.coupon_code_discount_percentage,
                                  deal.coupon_code_discount_amount,
                                  deal.coupon_code_discount_currency_id
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Discount
                              </div>
                              {deal.coupon_code && (
                                <code className="px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-800 block mt-2">
                                  {deal.coupon_code}
                                </code>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Deal Details</p>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Valid From:</span>
                                  <span className="ml-2 font-medium">{formatDate(deal.date_valid_from)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Valid Until:</span>
                                  <span className="ml-2 font-medium">{formatDate(deal.date_valid_to)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Thresholds</p>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Threshold:</span>
                                  <span className="ml-2 font-medium">
                                    {formatCurrency(deal.threshold_amount, deal.threshold_amount_currency_id)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Purchase Limit:</span>
                                  <span className="ml-2 font-medium">
                                    {formatCurrency(deal.purchase_limit_amount, deal.purchase_limit_amount_currency_id)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              {deal.relationship?.offers?.[0]?.tracking_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={deal.relationship.offers[0].tracking_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Track
                                  </a>
                                </Button>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {deal.deal_categories.length} categories
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </SignedIn>
          </main>
        </div>
      </div>
    )
  }

export default DealsPage
