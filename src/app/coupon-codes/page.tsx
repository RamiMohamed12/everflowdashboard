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
  Tag, 
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface CouponCode {
  network_coupon_code_id: number
  network_id: number
  network_offer_id: number
  coupon_code: string
  coupon_status: string
  tracking_link: string
  start_date: string
  end_date: string
  description: string
  is_description_plain_text: boolean
  time_created: number
  time_saved: number
  relationship?: {
    offer: {
      network_offer_id: number
      network_id: number
      name: string
      offer_status: string
    }
  }
}

interface CouponCodesData {
  coupon_codes: CouponCode[]
}

const CouponCodesPage = () => {
  const [data, setData] = useState<CouponCodesData>({ coupon_codes: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    coupon_status: 'all',
    offer_status: 'all',
    has_expiry: 'all'
  })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [hiddenCodes, setHiddenCodes] = useState<Set<number>>(new Set())

  const fetchCouponCodes = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Fetching coupon codes with filters:', filters)

      const response = await fetch('/api/everflow/coupon-codes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch coupon codes: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Coupon codes response:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      let filteredCodes = result.data.coupon_codes || []

      // Apply client-side filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredCodes = filteredCodes.filter((code: CouponCode) =>
          code.coupon_code.toLowerCase().includes(searchLower) ||
          code.description.toLowerCase().includes(searchLower) ||
          code.relationship?.offer.name.toLowerCase().includes(searchLower)
        )
      }

      if (filters.coupon_status !== 'all') {
        filteredCodes = filteredCodes.filter((code: CouponCode) => code.coupon_status === filters.coupon_status)
      }

      if (filters.offer_status !== 'all') {
        filteredCodes = filteredCodes.filter((code: CouponCode) => 
          code.relationship?.offer.offer_status === filters.offer_status
        )
      }

      if (filters.has_expiry !== 'all') {
        if (filters.has_expiry === 'yes') {
          filteredCodes = filteredCodes.filter((code: CouponCode) => code.end_date && code.end_date !== '')
        } else {
          filteredCodes = filteredCodes.filter((code: CouponCode) => !code.end_date || code.end_date === '')
        }
      }

      setData({ coupon_codes: filteredCodes })
      setSource(result.source || 'unknown')
      setLoading(false)

    } catch (error) {
      console.error('Error fetching coupon codes:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch coupon codes')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCouponCodes()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCouponCodes()
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search, filters.coupon_status, filters.offer_status, filters.has_expiry])

  const handleRefresh = () => {
    setError(null)
    fetchCouponCodes()
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '') return 'No expiry'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  const copyToClipboard = async (text: string, codeId: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleCodeVisibility = (codeId: number) => {
    const newHiddenCodes = new Set(hiddenCodes)
    if (newHiddenCodes.has(codeId)) {
      newHiddenCodes.delete(codeId)
    } else {
      newHiddenCodes.add(codeId)
    }
    setHiddenCodes(newHiddenCodes)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'paused':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Paused</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isExpired = (endDate: string) => {
    if (!endDate || endDate === '') return false
    try {
      const date = new Date(endDate)
      return date < new Date()
    } catch {
      return false
    }
  }

  const isExpiringSoon = (endDate: string) => {
    if (!endDate || endDate === '') return false
    try {
      const date = new Date(endDate)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    } catch {
      return false
    }
  }

  const exportToCSV = () => {
    if (data.coupon_codes.length === 0) return

    const headers = [
      'ID', 'Coupon Code', 'Status', 'Offer', 'Start Date', 'End Date',
      'Description', 'Tracking Link', 'Created', 'Updated'
    ]

    const csvContent = [
      headers.join(','),
      ...data.coupon_codes.map(code => [
        code.network_coupon_code_id,
        `"${code.coupon_code}"`,
        code.coupon_status,
        `"${code.relationship?.offer?.name || 'N/A'}"`,
        `"${code.start_date}"`,
        `"${code.end_date}"`,
        `"${code.description.replace(/"/g, '""')}"`,
        `"${code.tracking_link}"`,
        `"${new Date(code.time_created * 1000).toLocaleDateString()}"`,
        `"${new Date(code.time_saved * 1000).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `coupon_codes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const statsCards = [
    {
      title: "Total Coupons",
      value: data.coupon_codes.length,
      icon: <Tag className="h-6 w-6 text-blue-600" />,
      color: "text-blue-600"
    },
    {
      title: "Active Coupons",
      value: data.coupon_codes.filter(code => code.coupon_status === 'active').length,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      color: "text-green-600"
    },
    {
      title: "Expiring Soon",
      value: data.coupon_codes.filter(code => isExpiringSoon(code.end_date)).length,
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      color: "text-yellow-600"
    },
    {
      title: "Expired",
      value: data.coupon_codes.filter(code => isExpired(code.end_date)).length,
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      color: "text-red-600"
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
              <h1 className="text-2xl font-bold mb-4">Coupon Codes</h1>
              <p className="text-muted-foreground mb-6">Please sign in to access coupon codes management</p>
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
                  <h1 className="text-3xl font-bold">Coupon Codes</h1>
                  <p className="text-muted-foreground">
                    Manage and monitor all coupon codes and promotional offers
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
                    disabled={data.coupon_codes.length === 0}
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
                          placeholder="Search coupons, offers..."
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                        <Button onClick={() => {}} size="sm">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Select value={filters.coupon_status} onValueChange={(value) => setFilters({ ...filters, coupon_status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Coupon Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.offer_status} onValueChange={(value) => setFilters({ ...filters, offer_status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Offer Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Offers</SelectItem>
                        <SelectItem value="active">Active Offers</SelectItem>
                        <SelectItem value="inactive">Inactive Offers</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.has_expiry} onValueChange={(value) => setFilters({ ...filters, has_expiry: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Expiry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Coupons</SelectItem>
                        <SelectItem value="yes">With Expiry</SelectItem>
                        <SelectItem value="no">No Expiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading coupon codes from Everflow API...</p>
                  </div>
                )}

                {/* No coupon codes found */}
                {!loading && data.coupon_codes.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No coupon codes found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                    </CardContent>
                  </Card>
                )}

                {/* Coupon Codes Grid */}
                {!loading && data.coupon_codes.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Coupon Codes ({data.coupon_codes.length})</h2>
                    </div>
                    
                    <div className="grid gap-4">
                      {data.coupon_codes.map((code) => (
                        <Card key={code.network_coupon_code_id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <code className="px-3 py-1 rounded-md text-sm font-mono bg-gray-100 text-gray-800">
                                      {hiddenCodes.has(code.network_coupon_code_id) 
                                        ? '••••••••' 
                                        : code.coupon_code
                                      }
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleCodeVisibility(code.network_coupon_code_id)}
                                    >
                                      {hiddenCodes.has(code.network_coupon_code_id) ? (
                                        <Eye className="w-4 h-4" />
                                      ) : (
                                        <EyeOff className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(code.coupon_code, code.network_coupon_code_id)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {getStatusBadge(code.coupon_status)}
                                  {code.relationship?.offer && (
                                    <Badge variant="outline" className="text-xs">
                                      {code.relationship.offer.offer_status}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <span>ID: {code.network_coupon_code_id}</span>
                                  {code.relationship?.offer && (
                                    <>
                                      <span>•</span>
                                      <span>Offer: {code.relationship.offer.name}</span>
                                    </>
                                  )}
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  {code.is_description_plain_text ? 
                                    code.description : 
                                    <span dangerouslySetInnerHTML={{ __html: code.description }} />
                                  }
                                </p>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-medium mb-1">
                                  {formatDate(code.end_date)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Valid Until
                                </div>
                                {isExpired(code.end_date) && (
                                  <Badge variant="destructive" className="mt-1 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Expired
                                  </Badge>
                                )}
                                {isExpiringSoon(code.end_date) && !isExpired(code.end_date) && (
                                  <Badge variant="outline" className="mt-1 text-xs text-yellow-600 border-yellow-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Details</p>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="text-muted-foreground">Start:</span>
                                    <span className="ml-2 font-medium">{formatDate(code.start_date)}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="ml-2 font-medium">{new Date(code.time_created * 1000).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Offer Information</p>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="text-muted-foreground">Offer ID:</span>
                                    <span className="ml-2 font-medium">{code.network_offer_id}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Network:</span>
                                    <span className="ml-2 font-medium">{code.network_id}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                {code.tracking_link && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={code.tracking_link} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Track
                                    </a>
                                  </Button>
                                )}
                                {copiedCode === code.coupon_code && (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    Copied!
                                  </Badge>
                                )}
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

export default CouponCodesPage
