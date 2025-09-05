"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface ChartData {
  name: string;
  profit: number;
  id?: string;
}

interface ChartsProps {
  offerData?: ChartData[];
  affiliateData?: ChartData[];
  isLoading?: boolean;
  dateRange?: string;
}

export function Charts({ offerData, affiliateData, isLoading, dateRange }: ChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Profit: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const truncateName = (name: string, maxLength: number = 15) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
      {/* Profits by Offer Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profits by Offer</CardTitle>
          <p className="text-sm text-muted-foreground">
            Top {offerData?.length || 10} offers {dateRange && `for ${dateRange}`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {offerData && offerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={offerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tickFormatter={(value) => truncateName(value, 10)}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>No offer data available</p>
                  <p className="text-sm">Try adjusting your date range</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profits by Affiliate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profits by Affiliate</CardTitle>
          <p className="text-sm text-muted-foreground">
            Top {affiliateData?.length || 10} affiliates {dateRange && `for ${dateRange}`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {affiliateData && affiliateData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={affiliateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tickFormatter={(value) => truncateName(value, 10)}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>No affiliate data available</p>
                  <p className="text-sm">Try adjusting your date range</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
