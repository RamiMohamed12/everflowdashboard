"use client"

import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { useTrafficData } from '@/hooks/useTrafficData'
import { Search, Download, Filter, Shield, AlertTriangle, Ban, Activity } from 'lucide-react'

const TrafficManagement = () => {
  const { 
    data, 
    loading, 
    error, 
    filters, 
    source,
    setFilters, 
    fetchTrafficData, 
    clearError 
  } = useTrafficData()

  useEffect(() => {
    fetchTrafficData()
  }, [fetchTrafficData])

  const handleRefresh = () => {
    clearError()
    fetchTrafficData()
  }

  const formatDate = (timestamp: string | number) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    } catch {
      return 'Invalid Date'
    }
  }

  const exportToCSV = (dataArray: any[], filename: string) => {
    if (dataArray.length === 0) return

    const headers = Object.keys(dataArray[0])
    const csvContent = [
      headers.join(','),
      ...dataArray.map(row => 
        headers.map(header => {
          const value = row[header]
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getControlTypeBadge = (type: string) => {
    switch (type) {
      case 'blacklist':
        return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Blacklist</Badge>
      case 'whitelist':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" />Whitelist</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const statsCards = [
    {
      title: "Traffic Controls",
      value: data.traffic_controls.length,
      icon: <Activity className="h-6 w-6 text-blue-600" />,
      color: "text-blue-600"
    },
    {
      title: "Blocked Sources",
      value: data.blocked_sources.length,
      icon: <Ban className="h-6 w-6 text-red-600" />,
      color: "text-red-600"
    },
    {
      title: "Blocked Variables",
      value: data.blocked_variables.length,
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      color: "text-orange-600"
    },
    {
      title: "Active Controls",
      value: data.traffic_controls.filter(tc => tc.status === 'active').length,
      icon: <Shield className="h-6 w-6 text-green-600" />,
      color: "text-green-600"
    }
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            <SignedOut>
            <div className="flex items-center justify-center h-full">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle className="text-center">Authentication Required</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4">Please sign in to access traffic management.</p>
                  <SignInButton>
                    <Button>Sign In</Button>
                  </SignInButton>
                </CardContent>
              </Card>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Traffic Management</h1>
                  <p className="text-gray-600 mt-1">
                    Monitor and control traffic flow, blocked sources, and variables
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleRefresh}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <p className="text-red-800">{error}</p>
                      <Button 
                        onClick={clearError} 
                        variant="ghost" 
                        size="sm"
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                  <Card key={index} className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                        {stat.icon}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Filters */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Period</label>
                      <Select value={filters.time_period} onValueChange={(value) => setFilters({ time_period: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="1y">Last year</SelectItem>
                          <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search controls, sources..."
                          value={filters.search}
                          onChange={(e) => setFilters({ search: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({ status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Control Type</label>
                      <Select value={filters.control_type} onValueChange={(value) => setFilters({ control_type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="blacklist">Blacklist</SelectItem>
                          <SelectItem value="whitelist">Whitelist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Offer ID</label>
                      <Input
                        placeholder="Filter by offer ID"
                        value={filters.offer_id === 'all' ? '' : filters.offer_id}
                        onChange={(e) => setFilters({ offer_id: e.target.value || 'all' })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Data Tabs */}
              <Tabs defaultValue="controls" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="controls">Traffic Controls ({data.traffic_controls.length})</TabsTrigger>
                  <TabsTrigger value="sources">Blocked Sources ({data.blocked_sources.length})</TabsTrigger>
                  <TabsTrigger value="variables">Blocked Variables ({data.blocked_variables.length})</TabsTrigger>
                </TabsList>

                {/* Traffic Controls Tab */}
                <TabsContent value="controls" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Traffic Controls</h2>
                    <Button 
                      onClick={() => exportToCSV(data.traffic_controls, 'traffic_controls')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <Card className="bg-white">
                    <CardContent className="p-0">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Loading traffic controls...</p>
                        </div>
                      ) : data.traffic_controls.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No traffic controls found</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Apply All Offers</TableHead>
                              <TableHead>Valid From</TableHead>
                              <TableHead>Valid To</TableHead>
                              <TableHead>Variables</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.traffic_controls.map((control) => (
                              <TableRow key={control.network_traffic_control_id}>
                                <TableCell className="font-medium">
                                  {control.network_traffic_control_id}
                                </TableCell>
                                <TableCell>{getStatusBadge(control.status)}</TableCell>
                                <TableCell>{getControlTypeBadge(control.control_type)}</TableCell>
                                <TableCell>
                                  <Badge variant={control.is_apply_all_offers ? "default" : "secondary"}>
                                    {control.is_apply_all_offers ? "Yes" : "No"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(control.date_valid_from)}</TableCell>
                                <TableCell>{formatDate(control.date_valid_to)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {control.variables.slice(0, 3).map((variable, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {variable}
                                      </Badge>
                                    ))}
                                    {control.variables.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{control.variables.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Blocked Sources Tab */}
                <TabsContent value="sources" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Blocked Sources</h2>
                    <Button 
                      onClick={() => exportToCSV(data.blocked_sources, 'blocked_sources')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <Card className="bg-white">
                    <CardContent className="p-0">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Loading blocked sources...</p>
                        </div>
                      ) : data.blocked_sources.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Ban className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No blocked sources found</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Offer ID</TableHead>
                              <TableHead>Offer Name</TableHead>
                              <TableHead>Sub ID</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Last Updated</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.blocked_sources.map((source, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {source.network_offer_id}
                                </TableCell>
                                <TableCell>{source.offer_name || 'N/A'}</TableCell>
                                <TableCell>
                                  <code className="px-2 py-1 rounded text-sm font-mono">
                                    {source.sub_id}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="destructive">{source.traffic_blocking_status}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(source.time_created)}</TableCell>
                                <TableCell>{formatDate(source.time_saved)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Blocked Variables Tab */}
                <TabsContent value="variables" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Blocked Variables</h2>
                    <Button 
                      onClick={() => exportToCSV(data.blocked_variables, 'blocked_variables')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <Card className="bg-white">
                    <CardContent className="p-0">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Loading blocked variables...</p>
                        </div>
                      ) : data.blocked_variables.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No blocked variables found</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Variable</TableHead>
                              <TableHead>Operator</TableHead>
                              <TableHead>Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.blocked_variables.map((variable, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  <code className="px-2 py-1 rounded text-sm font-mono text-blue-800">
                                    {variable.variable}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{variable.operator}</Badge>
                                </TableCell>
                                <TableCell>
                                  <code className="px-2 py-1 rounded text-sm font-mono">
                                    {variable.value}
                                  </code>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </SignedIn>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TrafficManagement
