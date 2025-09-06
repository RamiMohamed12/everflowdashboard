"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { HeaderControls } from "@/components/header-controls";
import { KPICards } from "@/components/kpi-cards";
import { Charts } from "@/components/charts";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEverflowData, DateRange } from "@/hooks/useEverflowData";

function getDateRangeString(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const {
    dashboardSummary,
    offerProfits,
    affiliateProfits,
    loading,
    error,
    lastUpdated,
    refreshData,
  } = useEverflowData();

  // Load data on component mount and when date range changes
  useEffect(() => {
    refreshData(dateRange);
  }, [dateRange, refreshData]);

  const handleRefresh = async () => {
    await refreshData(dateRange);
  };

  const handleExportCSV = () => {
    try {
      // Prepare summary data with null checks
      const summaryData = dashboardSummary ? [
        ['Metric', 'Value'],
        ['Total Revenue', `$${(dashboardSummary.totalRevenue || 0).toLocaleString()}`],
        ['Total Profit', `$${(dashboardSummary.totalProfit || 0).toLocaleString()}`],
        ['Total Payout', `$${((dashboardSummary.totalRevenue || 0) - (dashboardSummary.totalProfit || 0)).toLocaleString()}`],
        ['Total Conversions', (dashboardSummary.totalConversions || 0).toLocaleString()],
        ['Profit Margin', `${(dashboardSummary.profitMargin || 0).toFixed(2)}%`],
        ['Date Range', dateRangeString],
        ['Export Date', new Date().toISOString()],
        [''], // Empty row separator
      ] : [
        ['Metric', 'Value'],
        ['Total Revenue', '$0'],
        ['Total Profit', '$0'],
        ['Total Payout', '$0'],
        ['Total Conversions', '0'],
        ['Profit Margin', '0.00%'],
        ['Date Range', dateRangeString],
        ['Export Date', new Date().toISOString()],
        [''], // Empty row separator
      ];

      // Prepare offer data
      const offerHeaders = ['Type', 'Offer Name', 'Offer ID', 'Profit', 'Revenue', 'Payout', 'Conversions'];
      const offerRows = offerProfits.map(offer => [
        'Offer',
        offer.name || 'Unknown',
        offer.id || 'Unknown',
        offer.profit || 0,
        offer.revenue || 0,
        offer.payout || 0,
        offer.conversions || 0
      ]);

      // Prepare affiliate data
      const affiliateHeaders = ['Type', 'Affiliate Name', 'Affiliate ID', 'Profit', 'Revenue', 'Payout', 'Conversions'];
      const affiliateRows = affiliateProfits.map(affiliate => [
        'Affiliate',
        affiliate.name || 'Unknown',
        affiliate.id || 'Unknown',
        affiliate.profit || 0,
        affiliate.revenue || 0,
        affiliate.payout || 0,
        affiliate.conversions || 0
      ]);

      // Combine all data
      const csvData = [
        ...summaryData,
        ['OFFER DATA'],
        offerHeaders,
        ...offerRows,
        [''], // Empty row separator
        ['AFFILIATE DATA'],
        affiliateHeaders,
        ...affiliateRows
      ];

      // Convert to CSV string
      const csvContent = csvData
        .map(row => row.map(cell => {
          // Handle cells that might contain commas or quotes
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
        .join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `everflow-dashboard-${dateRange.start}-to-${dateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`Exported dashboard data: ${offerProfits.length} offers, ${affiliateProfits.length} affiliates`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const dateRangeString = getDateRangeString(dateRange.start, dateRange.end);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar />
        
        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Dashboard Content - Always Visible */}
          <div className="min-h-full">
            <SignedOut>
              <div className="blur-sm pointer-events-none">
                {/* Header Controls */}
                <HeaderControls
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  onRefresh={handleRefresh}
                  lastUpdated={lastUpdated}
                  isLoading={loading}
                />
                
                {/* KPI Cards */}
                <KPICards
                  data={dashboardSummary}
                  isLoading={loading}
                />
                
                {/* Charts */}
                <Charts
                  offerData={offerProfits}
                  affiliateData={affiliateProfits}
                  isLoading={loading}
                  dateRange={dateRangeString}
                />
                
                {/* Data Table */}
                <div className="mt-4 mb-4">
                  <DataTable
                    offerData={offerProfits}
                    affiliateData={affiliateProfits}
                    isLoading={loading}
                  />
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              {/* Full Dashboard for Authenticated Users */}
              
              {/* Error Banner */}
              {error && (
                <div className="mx-6 mt-6 mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive font-medium">Error loading data</p>
                  <p className="text-destructive/80 text-sm mt-1">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleRefresh}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Header Controls */}
              <HeaderControls
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onRefresh={handleRefresh}
                onExportCSV={handleExportCSV}
                lastUpdated={lastUpdated}
                isLoading={loading}
              />
              
              {/* KPI Cards */}
              <KPICards
                data={dashboardSummary}
                isLoading={loading}
              />
              
              {/* Charts */}
              <Charts
                offerData={offerProfits}
                affiliateData={affiliateProfits}
                isLoading={loading}
                dateRange={dateRangeString}
              />
              
              {/* Data Table */}
              <div className="mt-4 mb-4">
                <DataTable
                  offerData={offerProfits}
                  affiliateData={affiliateProfits}
                  isLoading={loading}
                />
              </div>
            </SignedIn>
          </div>

          {/* Sign-in Overlay for Unauthenticated Users */}
          <SignedOut>
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
              <Card className="w-full max-w-md mx-4">
                <CardContent className="p-6 text-center">
                  <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
                  <p className="text-muted-foreground mb-6">
                    Please sign in to access your affiliate marketing dashboard and view detailed analytics.
                  </p>
                  <div className="space-y-3">
                    <SignInButton>
                      <Button className="w-full" size="lg">
                        Sign in to Dashboard
                      </Button>
                    </SignInButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
