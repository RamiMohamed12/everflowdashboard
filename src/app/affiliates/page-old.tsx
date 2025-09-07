"use client"

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { Users, Gift, Tag, Percent, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'

const AffiliatesPage = () => {
  const affiliateFeatures = [
    {
      title: "Offers Management",
      description: "Browse and manage all available affiliate offers with detailed analytics and performance tracking.",
      icon: <Gift className="h-8 w-8 text-blue-600" />,
      href: "/affiliate-offers",
      color: "border-blue-200 hover:border-blue-300"
    },
    {
      title: "Deals & Promotions",
      description: "Access exclusive deals and promotional campaigns to maximize your earning potential.",
      icon: <Tag className="h-8 w-8 text-green-600" />,
      href: "/deals",
      color: "border-green-200 hover:border-green-300"
    },
    {
      title: "Coupon Codes",
      description: "Manage and track coupon codes for better conversion rates and customer engagement.",
      icon: <Percent className="h-8 w-8 text-purple-600" />,
      href: "/coupon-codes",
      color: "border-purple-200 hover:border-purple-300"
    },
    {
      title: "Performance Analytics",
      description: "Coming soon - Comprehensive analytics and reporting for tracking your affiliate performance.",
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      href: "#",
      color: "border-orange-200 hover:border-orange-300",
      disabled: true
    }
  ]

  const quickStats = [
    {
      title: "Active Offers",
      value: "150+",
      description: "Available for promotion",
      icon: <Gift className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Live Deals",
      value: "45",
      description: "Current promotions",
      icon: <Tag className="h-6 w-6 text-green-600" />
    },
    {
      title: "Coupon Codes",
      value: "120",
      description: "Active discount codes",
      icon: <Percent className="h-6 w-6 text-purple-600" />
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      description: "Average performance",
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />
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
                <Card className="w-96 bg-white">
                  <CardHeader>
                    <CardTitle className="text-center">Authentication Required</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="mb-4">Please sign in to access the affiliate dashboard.</p>
                    <SignInButton>
                      <Button>Sign In</Button>
                    </SignInButton>
                  </CardContent>
                </Card>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-12 w-12 text-blue-600 mr-4" />
                    <h1 className="text-4xl font-bold text-gray-900">Affiliate Dashboard</h1>
                  </div>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Welcome to your comprehensive affiliate management hub. Access offers, deals, coupon codes, and analytics all in one place.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickStats.map((stat, index) => (
                    <Card key={index} className="bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.description}</p>
                          </div>
                          {stat.icon}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {affiliateFeatures.map((feature, index) => (
                    <Card 
                      key={index} 
                      className={`bg-white transition-all duration-200 ${feature.color} ${
                        feature.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      {feature.disabled ? (
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            {feature.icon}
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                              <p className="text-gray-600 mb-4">{feature.description}</p>
                              <Button disabled variant="outline">
                                Coming Soon
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link href={feature.href}>
                          <div className="p-6">
                            <div className="flex items-start space-x-4">
                              {feature.icon}
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 mb-4">{feature.description}</p>
                                <Button variant="outline">
                                  Access Now →
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )}
                    </Card>
                  ))}
                </div>

                {/* Getting Started Section */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-blue-900">Getting Started</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <span className="text-blue-600 font-bold text-lg">1</span>
                          </div>
                          <h4 className="font-semibold text-blue-900 mb-2">Browse Offers</h4>
                          <p className="text-blue-700 text-sm">Explore available affiliate offers and find the best matches for your audience.</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <span className="text-blue-600 font-bold text-lg">2</span>
                          </div>
                          <h4 className="font-semibold text-blue-900 mb-2">Access Deals</h4>
                          <p className="text-blue-700 text-sm">Get exclusive deals and coupon codes to boost your conversion rates.</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <span className="text-blue-600 font-bold text-lg">3</span>
                          </div>
                          <h4 className="font-semibold text-blue-900 mb-2">Track Performance</h4>
                          <p className="text-blue-700 text-sm">Monitor your campaigns and optimize for better results and higher earnings.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SignedIn>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AffiliatesPage
