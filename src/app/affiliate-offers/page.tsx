'use client'

import { useEffect, useState } from 'react'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAffiliateOffersData } from '@/hooks/useAffiliateOffersData'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { 
  Search, 
  Download, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor,
  Eye,
  MousePointer,
  Target,
  DollarSign,
  Calendar,
  Palette,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react'

export default function AffiliateOffersPage() {
  const { 
    offers, 
    loading, 
    error, 
    filters, 
    total, 
    source,
    setFilters, 
    fetchOffers, 
    clearError 
  } = useAffiliateOffersData()

  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchOffers()
  }, [])

  const handleRefresh = async () => {
    await fetchOffers()
  }

  const handleSearchSubmit = () => {
    setFilters({ search: searchInput })
  }

  const handleExportCSV = () => {
    if (offers.length === 0) return

    const headers = [
      'ID', 'Name', 'Category', 'Status', 'Payout Type', 'Default Payout',
      'Countries', 'Platforms', 'Device Types', 'Visibility', 'Affiliate Status',
      'Daily Conv Cap', 'Remaining Daily Conv', 'Daily Payout Cap', 'Remaining Daily Payout',
      'Impressions', 'Clicks', 'Conversions', 'Revenue', 'CVR %',
      'Creatives Count', 'Created Date', 'Updated Date'
    ]

    const csvContent = [
      headers.join(','),
      ...offers.map(offer => [
        offer.id,
        `"${offer.name}"`,
        offer.category,
        offer.status,
        offer.payout_type,
        offer.default_payout,
        `"${offer.countries.join('; ')}"`,
        `"${offer.platforms.join('; ')}"`,
        `"${offer.device_types.join('; ')}"`,
        offer.visibility,
        offer.affiliate_status,
        offer.caps.daily_conversions,
        offer.caps.remaining_daily_conversions,
        offer.caps.daily_payout,
        offer.caps.remaining_daily_payout,
        offer.performance.impressions,
        offer.performance.clicks,
        offer.performance.conversions,
        offer.performance.revenue,
        offer.performance.cvr,
        offer.creatives_count,
        new Date(offer.created_at).toLocaleDateString(),
        new Date(offer.updated_at).toLocaleDateString()
      ].join(','))
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `affiliate-offers-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'  
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'paused': return <Clock className="w-4 h-4" />
      case 'inactive': return <XCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getPayoutTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cpa': return 'bg-blue-100 text-blue-800'
      case 'cpl': return 'bg-purple-100 text-purple-800'
      case 'cpc': return 'bg-orange-100 text-orange-800'
      case 'revshare': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            <SignedOut>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Affiliate Offers Dashboard</h1>
                <p className="text-muted-foreground mb-6">Sign in to access your affiliate offers</p>
                <div className="max-w-4xl mx-auto grid gap-4 opacity-50 blur-sm pointer-events-none">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">Affiliate Offers</h1>
                    <p className="text-muted-foreground">
                      Manage and track your affiliate marketing campaigns with the Everflow API
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search offers..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    />
                    <Button onClick={handleSearchSubmit} size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Select value={filters.type} onValueChange={(value) => setFilters({ type: value as 'all' | 'runnable' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Offer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runnable">Runnable Only</SelectItem>
                    <SelectItem value="all">All Offers</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.category} onValueChange={(value) => setFilters({ category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => setFilters({ status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.visibility} onValueChange={(value) => setFilters({ visibility: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visibility</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(filters.search || filters.category !== 'all' || filters.status !== 'all' || filters.visibility !== 'all') && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSearchInput('')
                      setFilters({ search: '', category: 'all', status: 'all', visibility: 'all' })
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Offers</p>
                    <p className="text-2xl font-bold">{total}</p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Offers</p>
                    <p className="text-2xl font-bold text-green-600">
                      {offers.filter(o => o.status === 'Active').length}
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
                    <p className="text-sm font-medium text-muted-foreground">Avg. Payout</p>
                    <p className="text-2xl font-bold">
                      ${offers.length > 0 ? (offers.reduce((sum, o) => sum + o.default_payout, 0) / offers.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Source</p>
                    <p className="text-sm font-medium">
                      {source === 'everflow-affiliate' ? 'Live API' : 'Mock Data'}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-red-800">{error}</p>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading offers...</p>
            </div>
          )}

          {/* Offers Grid */}
          {!loading && offers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No offers found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </CardContent>
            </Card>
          )}

          {!loading && offers.length > 0 && (
            <div className="grid gap-6">
              {offers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{offer.name}</CardTitle>
                          <Badge className={getStatusColor(offer.status)}>
                            {getStatusIcon(offer.status)}
                            <span className="ml-1">{offer.status}</span>
                          </Badge>
                          <Badge className={getPayoutTypeColor(offer.payout_type)}>
                            {offer.payout_type.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>ID: {offer.id}</span>
                          <span>•</span>
                          <span>{offer.category}</span>
                          <span>•</span>
                          <span>{offer.visibility}</span>
                          <span>•</span>
                          <span>Status: {offer.affiliate_status}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${offer.default_payout.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {offer.payout_type}
                        </div>
                      </div>
                    </div>

                    <CardDescription className="mt-3">
                      {offer.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="targeting" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="targeting">Targeting</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="caps">Caps</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="targeting" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                              <Globe className="w-4 h-4" />
                              Countries ({offer.countries.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {offer.countries.slice(0, 6).map((country) => (
                                <Badge key={country} variant="outline" className="text-xs">
                                  {country}
                                </Badge>
                              ))}
                              {offer.countries.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{offer.countries.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                              <Monitor className="w-4 h-4" />
                              Platforms ({offer.platforms.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {offer.platforms.map((platform) => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                              <Smartphone className="w-4 h-4" />
                              Devices ({offer.device_types.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {offer.device_types.map((device) => (
                                <Badge key={device} variant="outline" className="text-xs">
                                  {device}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="performance" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Impressions</span>
                            </div>
                            <div className="text-xl font-bold">{offer.performance.impressions.toLocaleString()}</div>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <MousePointer className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Clicks</span>
                            </div>
                            <div className="text-xl font-bold">{offer.performance.clicks.toLocaleString()}</div>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Conversions</span>
                            </div>
                            <div className="text-xl font-bold">{offer.performance.conversions.toLocaleString()}</div>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Revenue</span>
                            </div>
                            <div className="text-xl font-bold">${offer.performance.revenue.toLocaleString()}</div>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">CVR</span>
                            </div>
                            <div className="text-xl font-bold">{offer.performance.cvr.toFixed(2)}%</div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="caps" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-3">Conversion Caps</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Daily ({offer.caps.remaining_daily_conversions} remaining)</span>
                                  <span>{offer.caps.daily_conversions}</span>
                                </div>
                                <Progress 
                                  value={offer.caps.daily_conversions > 0 ? 
                                    ((offer.caps.daily_conversions - offer.caps.remaining_daily_conversions) / offer.caps.daily_conversions) * 100 : 0} 
                                  className="h-2" 
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Weekly</div>
                                  <div className="font-medium">{offer.caps.weekly_conversions || 'Unlimited'}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Monthly</div>
                                  <div className="font-medium">{offer.caps.monthly_conversions || 'Unlimited'}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Global</div>
                                  <div className="font-medium">{offer.caps.global_conversions || 'Unlimited'}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-3">Payout Caps</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Daily (${offer.caps.remaining_daily_payout} remaining)</span>
                                  <span>${offer.caps.daily_payout}</span>
                                </div>
                                <Progress 
                                  value={offer.caps.daily_payout > 0 ? 
                                    ((offer.caps.daily_payout - offer.caps.remaining_daily_payout) / offer.caps.daily_payout) * 100 : 0} 
                                  className="h-2" 
                                />
                              </div>
                              <div className="grid grid-cols-1 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Palette className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Creatives:</span>
                                  <span className="font-medium">{offer.creatives_count}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Created:</span>
                              <span className="text-sm font-medium">
                                {new Date(offer.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Updated:</span>
                              <span className="text-sm font-medium">
                                {new Date(offer.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {offer.tracking_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={offer.tracking_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open Tracking URL
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SignedIn>
          </div>
        </main>
      </div>
    </div>
  )
}
