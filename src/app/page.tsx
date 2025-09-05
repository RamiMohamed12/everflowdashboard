"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { HeaderControls } from "@/components/header-controls";
import { KPICards } from "@/components/kpi-cards";
import { Charts } from "@/components/charts";
import { DataTable } from "@/components/data-table";
import { 
  mockKPIData, 
  mockPreviousKPIData, 
  mockOfferData, 
  mockAffiliateData, 
  mockTableData,
  getDateRangeString 
} from "@/lib/mock-data";

interface DateRange {
  start: string;
  end: string;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const dateRangeString = getDateRangeString(dateRange.start, dateRange.end);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />
        
        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {/* Header Controls */}
          <HeaderControls
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
            isLoading={isLoading}
          />
          
          {/* KPI Cards */}
          <KPICards
            data={mockKPIData}
            previousPeriodData={mockPreviousKPIData}
            isLoading={isLoading}
          />
          
          {/* Charts */}
          <Charts
            offerData={mockOfferData}
            affiliateData={mockAffiliateData}
            isLoading={isLoading}
            dateRange={dateRangeString}
          />
          
          {/* Data Table */}
          <div className="mt-6 mb-6">
            <DataTable
              data={mockTableData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
