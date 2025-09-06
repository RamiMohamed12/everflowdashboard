"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfitData } from "@/hooks/useEverflowData";

interface ChartsProps {
  offerData: ProfitData[];
  affiliateData: ProfitData[];
  isLoading: boolean;
  dateRange: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">ID: {data.id}</p>
        <p className="text-green-500 font-medium">
          Profit: ${data.profit.toLocaleString()}
        </p>
        <p className="text-blue-500 text-sm">
          Revenue: ${data.revenue.toLocaleString()}
        </p>
        <p className="text-orange-500 text-sm">
          Payout: ${data.payout.toLocaleString()}
        </p>
        <p className="text-purple-500 text-sm">
          Conversions: {data.conversions}
        </p>
      </div>
    );
  }
  return null;
};

// Truncate long names for display
const truncateName = (name: string, maxLength: number = 20) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

export function Charts({ offerData, affiliateData, isLoading, dateRange }: ChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profits by Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profits by Affiliate</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for charts with truncated names for display
  const processedOfferData = offerData.map(item => ({
    ...item,
    displayName: truncateName(item.name),
    fullName: item.name // Keep full name for tooltip
  }));

  const processedAffiliateData = affiliateData.map(item => ({
    ...item,
    displayName: truncateName(item.name),
    fullName: item.name // Keep full name for tooltip
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Profits by Offer Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profits by Offer</CardTitle>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </CardHeader>
        <CardContent>
          {processedOfferData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedOfferData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayName" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="profit" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No offer data available for this date range
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profits by Affiliate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profits by Affiliate</CardTitle>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </CardHeader>
        <CardContent>
          {processedAffiliateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedAffiliateData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayName" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="profit" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No affiliate data available for this date range
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
