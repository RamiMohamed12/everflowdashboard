"use client";

import { useState, useCallback } from 'react';

export interface OfferData {
  network_offer_id: number;
  name: string;
  offer_status: string;
  currency_id: string;
  default_payout: number;
  default_revenue: number;
  preview_url: string;
  offer_url: string;
  advertiser: {
    network_advertiser_id: number;
    name: string;
  };
  category?: string;
  countries?: string[];
  description?: string;
  time_created: number;
  time_saved: number;
}

export interface OffersFilters {
  search?: string;
  status?: string;
  advertiser?: string;
  category?: string;
}

export interface OffersResponse {
  success: boolean;
  data: OfferData[];
  paging?: {
    page: number;
    page_size: number;
    total_count: number;
  };
  timestamp: string;
}

export function useOffersData() {
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOffers = useCallback(async (filters: OffersFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/everflow/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          page_size: 100,
          search: filters.search || '',
          filters: Object.entries(filters)
            .filter(([key, value]) => key !== 'search' && value)
            .map(([key, value]) => ({ field: key, value }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: OffersResponse = await response.json();
      
      console.log('Offers API Response:', result); // Debug log
      
      if (result.success) {
        const offersData = result.data || [];
        console.log('Offers data:', offersData); // Debug log
        setOffers(offersData);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch offers data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching offers:', err);
      
      // Set empty data on error
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOffers = useCallback((filters: OffersFilters = {}) => {
    return fetchOffers(filters);
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    lastUpdated,
    fetchOffers,
    refreshOffers,
  };
}
