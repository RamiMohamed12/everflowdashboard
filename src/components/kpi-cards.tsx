"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Gift, Users, Target } from "lucide-react";

interface KPIData {
  totalProfit: number;
  offersWithProfit: number;
  affiliatesWithProfit: number;
  eCPA?: number;
  margin?: number;
}

interface KPICardsProps {
  data?: KPIData;
  isLoading?: boolean;
  previousPeriodData?: KPIData;
}

export function KPICards({ data, isLoading, previousPeriodData }: KPICardsProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const kpis = [
    {
      title: "Total Profit",
      value: data?.totalProfit || 0,
      previous: previousPeriodData?.totalProfit || 0,
      format: formatCurrency,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Offers with Profit",
      value: data?.offersWithProfit || 0,
      previous: previousPeriodData?.offersWithProfit || 0,
      format: (v: number) => v.toString(),
      icon: Gift,
      color: "text-blue-500",
    },
    {
      title: "Affiliates with Profit",
      value: data?.affiliatesWithProfit || 0,
      previous: previousPeriodData?.affiliatesWithProfit || 0,
      format: (v: number) => v.toString(),
      icon: Users,
      color: "text-purple-500",
    },
    {
      title: "eCPA",
      value: data?.eCPA || 0,
      previous: previousPeriodData?.eCPA || 0,
      format: formatCurrency,
      icon: Target,
      color: "text-orange-500",
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
        const change = calculateChange(kpi.value, kpi.previous);
        const isPositive = change > 0;
        const hasChange = previousPeriodData && kpi.previous !== 0;

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
              {hasChange && (
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
                    {formatPercentage(change)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs prev period</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
