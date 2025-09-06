import { useState, useEffect, useCallback } from "react";

export interface DateRange {
  start: string;
  end: string;
}

export interface EverflowAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface DashboardSummary {
  totalProfit: number;
  totalRevenue: number;
  totalConversions: number;
  profitMargin: number;
  trends: {
    profit: number;
    revenue: number;
    conversions: number;
    margin: number;
  };
}

export interface ProfitData {
  id: string;
  name: string;
  profit: number;
  conversions: number;
  revenue: number;
  payout: number;
}

export interface ProfitsResponse {
  profits: ProfitData[];
  groupBy: string;
  dateRange: DateRange;
  totalEntities: number;
  totalConversions: number;
}

export function useEverflowData() {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [offerProfits, setOfferProfits] = useState<ProfitData[]>([]);
  const [affiliateProfits, setAffiliateProfits] = useState<ProfitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/everflow/dashboard-summary');
      const result: EverflowAPIResponse<DashboardSummary> = await response.json();
      
      if (result.success && result.data) {
        setDashboardSummary(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard summary');
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const fetchProfitsByOffer = useCallback(async (dateRange: DateRange) => {
    try {
      const response = await fetch('/api/everflow/profits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: dateRange.start,
          to: dateRange.end,
          groupBy: 'offer',
          limit: 10
        })
      });
      
      const result: EverflowAPIResponse<ProfitsResponse> = await response.json();
      
      if (result.success && result.data) {
        setOfferProfits(result.data.profits);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch profits by offer');
      }
    } catch (err) {
      console.error('Error fetching profits by offer:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const fetchProfitsByAffiliate = useCallback(async (dateRange: DateRange) => {
    try {
      const response = await fetch('/api/everflow/profits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: dateRange.start,
          to: dateRange.end,
          groupBy: 'affiliate',
          limit: 10
        })
      });
      
      const result: EverflowAPIResponse<ProfitsResponse> = await response.json();
      
      if (result.success && result.data) {
        setAffiliateProfits(result.data.profits);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch profits by affiliate');
      }
    } catch (err) {
      console.error('Error fetching profits by affiliate:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const refreshData = useCallback(async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchDashboardSummary(),
        fetchProfitsByOffer(dateRange),
        fetchProfitsByAffiliate(dateRange)
      ]);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardSummary, fetchProfitsByOffer, fetchProfitsByAffiliate]);

  return {
    dashboardSummary,
    offerProfits,
    affiliateProfits,
    loading,
    error,
    lastUpdated,
    refreshData,
  };
}
