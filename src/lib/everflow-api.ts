// Utility functions for Everflow API calls
const EVERFLOW_API_URL = process.env.EF_API_URL || 'https://api.eflow.team/v1/networks/';
const EVERFLOW_AFFILIATE_URL = process.env.EF_URL_AFFILIATE || 'https://api.eflow.team/v1/affiliates/';
const EVERFLOW_API_KEY = process.env.EF_API_KEY;

if (!EVERFLOW_API_KEY) {
  throw new Error('EF_API_KEY environment variable is required');
}

export interface EverflowHeaders {
  'X-Eflow-API-Key': string;
  'Content-Type': string;
  [key: string]: string;
}

export const everflowHeaders: EverflowHeaders = {
  'X-Eflow-API-Key': EVERFLOW_API_KEY,
  'Content-Type': 'application/json',
};

export async function everflowRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
) {
  const url = `${EVERFLOW_API_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: everflowHeaders,
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Everflow API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Everflow API request failed:', error);
    throw error;
  }
}

export async function everflowAffiliateRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
) {
  const url = `${EVERFLOW_AFFILIATE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: everflowHeaders,
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Everflow Affiliate API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Everflow Affiliate API request failed:', error);
    throw error;
  }
}

export interface DateRange {
  from: string;
  to: string;
}

export interface ConversionFilter {
  filter_id_value: string;
  resource_type: string;
}

export interface ConversionReportParams {
  from: string;
  to: string;
  timezone_id: number;
  show_conversions: boolean;
  show_events: boolean;
  query?: {
    filters?: ConversionFilter[];
  };
  page?: number;
  page_size?: number;
}
