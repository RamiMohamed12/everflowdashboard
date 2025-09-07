import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { everflowRequest } from "@/lib/everflow-api";

// Mock data for when no affiliates are returned or API key is not configured
const mockAffiliates = [
  {
    network_affiliate_id: 1,
    name: "Premium Media Group",
    account_status: "active",
    account_manager_id: 1,
    account_manager_name: "John Smith",
    today_revenue: "$125.50",
    time_created: Date.now() / 1000 - 86400 * 30,
    time_saved: Date.now() / 1000 - 86400,
    labels: ["media_buyer", "premium"],
    balance: 2500.00,
    last_login: Date.now() / 1000 - 3600,
    is_payable: true,
    payment_type: "wire"
  },
  {
    network_affiliate_id: 2,
    name: "Digital Marketing Solutions",
    account_status: "active",
    account_manager_id: 2,
    account_manager_name: "Sarah Johnson",
    today_revenue: "$89.25",
    time_created: Date.now() / 1000 - 86400 * 45,
    time_saved: Date.now() / 1000 - 86400 * 2,
    labels: ["agency", "performance"],
    balance: 1850.75,
    last_login: Date.now() / 1000 - 7200,
    is_payable: true,
    payment_type: "paypal"
  },
  {
    network_affiliate_id: 3,
    name: "Global Affiliate Network",
    account_status: "inactive",
    account_manager_id: 1,
    account_manager_name: "John Smith",
    today_revenue: "$0.00",
    time_created: Date.now() / 1000 - 86400 * 60,
    time_saved: Date.now() / 1000 - 86400 * 15,
    labels: ["network"],
    balance: 0.00,
    last_login: Date.now() / 1000 - 86400 * 10,
    is_payable: false,
    payment_type: "none"
  },
  {
    network_affiliate_id: 4,
    name: "Social Media Experts",
    account_status: "active",
    account_manager_id: 3,
    account_manager_name: "Mike Davis",
    today_revenue: "$234.80",
    time_created: Date.now() / 1000 - 86400 * 20,
    time_saved: Date.now() / 1000 - 3600,
    labels: ["social", "influencer"],
    balance: 3200.50,
    last_login: Date.now() / 1000 - 1800,
    is_payable: true,
    payment_type: "wire"
  },
  {
    network_affiliate_id: 5,
    name: "Mobile App Promoters",
    account_status: "active",
    account_manager_id: 2,
    account_manager_name: "Sarah Johnson",
    today_revenue: "$67.15",
    time_created: Date.now() / 1000 - 86400 * 90,
    time_saved: Date.now() / 1000 - 86400 * 3,
    labels: ["mobile", "app"],
    balance: 1100.25,
    last_login: Date.now() / 1000 - 14400,
    is_payable: true,
    payment_type: "check"
  }
];

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Debug: Check if environment variables are loaded
    console.log('Environment check:', {
      hasApiKey: !!process.env.EF_API_KEY,
      apiUrl: process.env.EF_API_URL
    });

    const body = await request.json();
    const { 
      page = 1,
      page_size = 50,
      search = "",
      filters = []
    } = body;

    try {
      // Fetch affiliates from Everflow using the networks API
      // Use affiliatestable endpoint with proper query parameters and request body
      const requestBody: any = {
        filters: {
          account_status: "active" // Default to active affiliates
        }
      };

      // Add search terms if search is provided
      if (search && search.trim()) {
        requestBody.search_terms = [{
          search_type: "name",
          value: search.trim()
        }];
      }

      // Add additional filters if provided
      if (filters && filters.length > 0) {
        // Merge any additional filters from the request
        Object.assign(requestBody.filters, ...filters);
      }

      // Build query parameters for paging
      const queryParams = new URLSearchParams();
      if (page && page > 1) {
        queryParams.set('page', page.toString());
      }
      if (page_size && page_size !== 50) {
        queryParams.set('page_size', page_size.toString());
      }
      
      // Add relationships to get additional data
      queryParams.set('relationship', 'signup,users');

      const endpoint = `affiliatestable${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const affiliatesData = await everflowRequest(
        endpoint, 
        'POST',
        requestBody
      );

      // Extract affiliates array from response
      const affiliates = affiliatesData?.affiliates || [];

      // Normalize the affiliates data to ensure consistent structure
      const normalizedAffiliates = affiliates.map((affiliate: any) => ({
        ...affiliate,
        // Ensure revenue is parsed correctly
        today_revenue_amount: parseFloat(affiliate.today_revenue?.replace(/[$,]/g, '') || '0'),
        // Ensure dates are properly formatted
        last_login_date: affiliate.last_login ? new Date(affiliate.last_login * 1000) : null,
        created_date: new Date(affiliate.time_created * 1000),
        updated_date: new Date(affiliate.time_saved * 1000),
      }));

      // If no affiliates returned from API, use mock data for demo
      const finalAffiliates = normalizedAffiliates.length > 0 ? normalizedAffiliates : mockAffiliates;

      return NextResponse.json({
        success: true,
        data: finalAffiliates,
        paging: affiliatesData?.paging,
        timestamp: new Date().toISOString(),
        usingMockData: normalizedAffiliates.length === 0,
      });
    } catch (apiError) {
      console.log('Everflow API error, returning mock data:', apiError);
      
      // Return mock data when API fails
      return NextResponse.json({
        success: true,
        data: mockAffiliates,
        timestamp: new Date().toISOString(),
        usingMockData: true,
        apiError: apiError instanceof Error ? apiError.message : 'API Error',
      });
    }
  } catch (error) {
    console.error('Affiliates API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch affiliates",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Debug: Check if environment variables are loaded
    console.log('Environment check:', {
      hasApiKey: !!process.env.EF_API_KEY,
      apiUrl: process.env.EF_API_URL
    });

    try {
      // Fetch affiliates from Everflow using the networks API  
      // Use affiliatestable endpoint with basic active affiliate filter and relationships
      const requestBody = {
        filters: {
          account_status: "active" // Get active affiliates by default
        }
      };

      // Add relationships to get additional data
      const queryParams = new URLSearchParams();
      queryParams.set('relationship', 'signup,users');
      queryParams.set('page_size', '50'); // Default page size

      const endpoint = `affiliatestable?${queryParams.toString()}`;

      const affiliatesData = await everflowRequest(
        endpoint, 
        'POST',
        requestBody
      );

      // Extract affiliates array from response
      const affiliates = affiliatesData?.affiliates || [];

      // Normalize the affiliates data to ensure consistent structure
      const normalizedAffiliates = affiliates.map((affiliate: any) => ({
        ...affiliate,
        // Ensure revenue is parsed correctly
        today_revenue_amount: parseFloat(affiliate.today_revenue?.replace(/[$,]/g, '') || '0'),
        // Ensure dates are properly formatted
        last_login_date: affiliate.last_login ? new Date(affiliate.last_login * 1000) : null,
        created_date: new Date(affiliate.time_created * 1000),
        updated_date: new Date(affiliate.time_saved * 1000),
      }));

      // If no affiliates returned from API, use mock data for demo
      const finalAffiliates = normalizedAffiliates.length > 0 ? normalizedAffiliates : mockAffiliates;

      return NextResponse.json({
        success: true,
        data: finalAffiliates,
        paging: affiliatesData?.paging,
        timestamp: new Date().toISOString(),
        usingMockData: normalizedAffiliates.length === 0,
      });
    } catch (apiError) {
      console.log('Everflow API error, returning mock data:', apiError);
      
      // Return mock data when API fails
      return NextResponse.json({
        success: true,
        data: mockAffiliates,
        timestamp: new Date().toISOString(),
        usingMockData: true,
        apiError: apiError instanceof Error ? apiError.message : 'API Error',
      });
    }
  } catch (error) {
    console.error('Affiliates GET API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch affiliates",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
