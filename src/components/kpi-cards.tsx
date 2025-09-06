"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Gift, Users, Target } from "lucide-react";
import { DashboardSummary } from "@/hooks/useEverflowData";

interface KPICardsProps {
  data?: DashboardSummary | null; 
  isLoading?: boolean;
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const kpis = [
    {
      title: "Total Profit",
      value: data?.totalProfit || 0,
      trending: data?.trends?.profit || 0,
      format: formatCurrency,
      icon: DollarSign,
      color: "text-green-500",
      description: "vs yesterday"
    },
    {
      title: "Total Revenue",
      value: data?.totalRevenue || 0,
      trending: data?.trends?.revenue || 0,
      format: formatCurrency,
      icon: Gift,
      color: "text-blue-500",
      description: "vs yesterday"
    },
    {
      title: "Total Conversions",
      value: data?.totalConversions || 0,
      trending: data?.trends?.conversions || 0,
      format: formatNumber,
      icon: Users,
      color: "text-purple-500",
      description: "vs yesterday"
    },
    {
      title: "Profit Margin",
      value: data?.profitMargin || 0,
      trending: data?.trends?.margin || 0,
      format: (v: number) => isNaN(v) ? '0.0%' : `${v.toFixed(1)}%`,
      icon: Target,
      color: "text-orange-500",
      description: "current margin"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isPositive = kpi.trending > 0;
        const hasTrending = kpi.trending !== 0;

        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.format(kpi.value)}</div>
              {hasTrending && (
                <div className="flex items-center space-x-1 mt-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      isPositive ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'
                    }`}
                  >
                    {formatPercentage(kpi.trending)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{kpi.description}</span>
                </div>
              )}
              {!hasTrending && (
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
