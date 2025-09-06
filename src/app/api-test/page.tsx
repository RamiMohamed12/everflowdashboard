"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}

export default function APITestPage() {
  const [responses, setResponses] = useState<Record<string, APIResponse>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [dateRange, setDateRange] = useState({
    from: "2025-01-01",
    to: "2025-01-31"
  });

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    const key = endpoint;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      setResponses(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      setResponses(prev => ({ 
        ...prev, 
        [key]: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const ResponseCard = ({ title, endpoint, data, loading: isLoading }: {
    title: string;
    endpoint: string;
    data?: APIResponse;
    loading: boolean;
  }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant={data?.success ? "default" : "destructive"}>
            {data?.success ? "Success" : data?.error ? "Error" : "Not tested"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">Testing...</div>
        ) : data ? (
          <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="text-muted-foreground">Click test button to run</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Everflow API Test Dashboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Date Range (for conversion reports)</h2>
        <div className="flex gap-4 mb-4">
          <Input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            placeholder="From date"
          />
          <Input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            placeholder="To date"
          />
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Tests</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="profits">Profits</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="space-y-4">
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => testEndpoint('/api/everflow/test')}
                disabled={loading['/api/everflow/test']}
              >
                Test Auth & Environment
              </Button>
              <Button 
                onClick={() => testEndpoint('/api/everflow/dashboard-summary')}
                disabled={loading['/api/everflow/dashboard-summary']}
              >
                Test Dashboard Summary
              </Button>
            </div>

            <ResponseCard
              title="Authentication & Environment Test"
              endpoint="/api/everflow/test"
              data={responses['/api/everflow/test']}
              loading={loading['/api/everflow/test']}
            />

            <ResponseCard
              title="Dashboard Summary"
              endpoint="/api/everflow/dashboard-summary"
              data={responses['/api/everflow/dashboard-summary']}
              loading={loading['/api/everflow/dashboard-summary']}
            />
          </div>
        </TabsContent>

        <TabsContent value="entities">
          <div className="space-y-4">
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => testEndpoint('/api/everflow/offers')}
                disabled={loading['/api/everflow/offers']}
              >
                Test Offers
              </Button>
              <Button 
                onClick={() => testEndpoint('/api/everflow/affiliates')}
                disabled={loading['/api/everflow/affiliates']}
              >
                Test Affiliates
              </Button>
              <Button 
                onClick={() => testEndpoint('/api/everflow/advertisers')}
                disabled={loading['/api/everflow/advertisers']}
              >
                Test Advertisers
              </Button>
            </div>

            <ResponseCard
              title="Offers"
              endpoint="/api/everflow/offers"
              data={responses['/api/everflow/offers']}
              loading={loading['/api/everflow/offers']}
            />

            <ResponseCard
              title="Affiliates"
              endpoint="/api/everflow/affiliates"
              data={responses['/api/everflow/affiliates']}
              loading={loading['/api/everflow/affiliates']}
            />

            <ResponseCard
              title="Advertisers"
              endpoint="/api/everflow/advertisers"
              data={responses['/api/everflow/advertisers']}
              loading={loading['/api/everflow/advertisers']}
            />
          </div>
        </TabsContent>

        <TabsContent value="conversions">
          <div className="space-y-4">
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => testEndpoint('/api/everflow/conversions', 'POST', {
                  from: dateRange.from,
                  to: dateRange.to,
                  timezone_id: 67,
                  page_size: 50
                })}
                disabled={loading['/api/everflow/conversions']}
              >
                Test Conversions Report
              </Button>
            </div>

            <ResponseCard
              title="Conversions Report"
              endpoint="/api/everflow/conversions"
              data={responses['/api/everflow/conversions']}
              loading={loading['/api/everflow/conversions']}
            />
          </div>
        </TabsContent>

        <TabsContent value="profits">
          <div className="space-y-4">
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => testEndpoint('/api/everflow/profits', 'POST', {
                  from: dateRange.from,
                  to: dateRange.to,
                  groupBy: 'offer',
                  limit: 10
                })}
                disabled={loading['/api/everflow/profits-offer']}
              >
                Test Profits by Offer
              </Button>
              <Button 
                onClick={() => testEndpoint('/api/everflow/profits', 'POST', {
                  from: dateRange.from,
                  to: dateRange.to,
                  groupBy: 'affiliate',
                  limit: 10
                })}
                disabled={loading['/api/everflow/profits-affiliate']}
              >
                Test Profits by Affiliate
              </Button>
            </div>

            <ResponseCard
              title="Profits by Offer"
              endpoint="/api/everflow/profits (groupBy: offer)"
              data={responses['/api/everflow/profits']}
              loading={loading['/api/everflow/profits-offer']}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
