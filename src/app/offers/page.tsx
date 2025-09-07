"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Search, Eye, ExternalLink, DollarSign, Target, TrendingUp } from "lucide-react"
import { useOffersData } from "@/hooks/useOffersData"

export default function OffersPage() {
  const { 
    offers, 
    loading, 
    error, 
    fetchOffers
  } = useOffersData()
  
  const [searchInput, setSearchInput] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: ""
  })

  // Load data on component mount
  useEffect(() => {
    fetchOffers(filters)
  }, [fetchOffers])

  const handleRefresh = async () => {
    await fetchOffers(filters)
  }

  const handleSearch = () => {
    const newFilters = { ...filters, search: searchInput }
    setFilters(newFilters)
    fetchOffers(newFilters)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? '' : value }
    setFilters(newFilters)
    fetchOffers(newFilters)
  }

  const handleExportCSV = () => {
    try {
      const headers = [
        'Offer ID', 'Offer Name', 'Status', 'Category', 'Default Payout', 'Default Revenue',
        'Countries', 'Advertiser', 'Currency', 'Preview URL', 'Offer URL',
        'Created Date', 'Updated Date'
      ]
      
      const csvData = offers.map(offer => [
        offer.network_offer_id,
        offer.name,
        offer.offer_status,
        offer.category || 'N/A',
        offer.default_payout,
        offer.default_revenue,
        (offer.countries || []).join('; '),
        offer.advertiser.name,
        offer.currency_id,
        offer.preview_url,
        offer.offer_url,
        new Date(offer.time_created).toLocaleDateString(),
        new Date(offer.time_saved).toLocaleDateString()
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
      link.setAttribute('download', `affiliate-offers-${format(new Date(), 'yyyy-MM-dd')}.csv`)
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
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
        
        <main className="flex-1 overflow-auto p-6">
          <SignedOut>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Offers Dashboard</h1>
              <p className="text-muted-foreground mb-6">Please sign in to access your offers</p>
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
                  <h1 className="text-3xl font-bold">Network Offers</h1>
                  <p className="text-muted-foreground">
                    Manage and track your network offers using the Everflow Networks API
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
                          placeholder="Search offers..."
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
                      value={filters.category || 'all'} 
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
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
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Offers</p>
                        <p className="text-2xl font-bold">{offers.length}</p>
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
                          {offers.filter(o => o.offer_status === 'active').length}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
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
                        <p className="text-sm font-medium text-green-600">
                          🟢 Networks API
                        </p>
                      </div>
                      <Eye className="h-8 w-8 text-muted-foreground" />
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
                  <p className="mt-4 text-muted-foreground">Loading offers from Everflow API...</p>
                </div>
              )}

              {/* No offers found */}
              {!loading && offers.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No offers found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                  </CardContent>
                </Card>
              )}

              {/* Offers Grid */}
              {!loading && offers.length > 0 && (
                <div className="grid gap-4">
                  {offers.map((offer) => (
                    <Card key={offer.network_offer_id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{offer.name}</h3>
                              <Badge className={getStatusColor(offer.offer_status)}>
                                {offer.offer_status}
                              </Badge>
                              <Badge variant="outline">
                                {offer.currency_id}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>ID: {offer.network_offer_id}</span>
                              <span>•</span>
                              <span>{offer.category || 'General'}</span>
                              <span>•</span>
                              <span>Advertiser: {offer.advertiser.name}</span>
                            </div>

                            <p className="text-sm text-muted-foreground">{offer.description || 'No description available'}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${offer.default_payout.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Payout
                            </div>
                            <div className="text-sm font-medium text-blue-600 mt-1">
                              Rev: ${offer.default_revenue.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Countries ({(offer.countries || []).length})</p>
                            <div className="flex flex-wrap gap-1">
                              {(offer.countries || []).slice(0, 5).map((country) => (
                                <Badge key={country} variant="outline" className="text-xs">
                                  {country}
                                </Badge>
                              ))}
                              {(offer.countries || []).length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(offer.countries || []).length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Details</p>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Created:</span>
                                <span className="ml-1 font-medium">
                                  {new Date(offer.time_created * 1000).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Updated:</span>
                                <span className="ml-1 font-medium">
                                  {new Date(offer.time_saved * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            {offer.preview_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={offer.preview_url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </a>
                              </Button>
                            )}
                            {offer.offer_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={offer.offer_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Track
                                </a>
                              </Button>
                            )}
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
