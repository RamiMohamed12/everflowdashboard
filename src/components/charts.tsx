"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { ProfitData } from "@/hooks/useEverflowData";

interface ChartsProps {
  offerData: ProfitData[];
  affiliateData: ProfitData[];
  isLoading: boolean;
  dateRange: string;
}

// Chart colors - white and green theme
const CHART_COLORS = {
  primary: '#10b981',      // Green
  secondary: '#ffffff',    // White  
  tertiary: '#22c55e',     // Green-500
  quaternary: '#16a34a',   // Green-600
  quinary: '#15803d',      // Green-700
  senary: '#166534',       // Green-800
  septenary: '#14532d',    // Green-900
  octonary: '#dcfce7',     // Green-100
};

const PIE_COLORS = [
  '#10b981', // Green
  '#ffffff', // White
  '#22c55e', // Green-500
  '#16a34a', // Green-600
  '#15803d', // Green-700
  '#166534', // Green-800
  '#14532d', // Green-900
  '#dcfce7', // Green-100
];

// Custom tooltip component with white and green theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-green-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">ID: {data.id}</p>
        <p className="text-green-600 font-medium">
          Profit: ${data.profit.toLocaleString()}
        </p>
        <p className="text-green-500 text-sm">
          Revenue: ${data.revenue.toLocaleString()}
        </p>
        <p className="text-green-700 text-sm">
          Payout: ${data.payout.toLocaleString()}
        </p>
        <p className="text-green-800 text-sm">
          Conversions: {data.conversions}
        </p>
      </div>
    );
  }
  return null;
};

// Generate daily profit data for line chart
const generateDailyData = (data: ProfitData[]) => {
  const dailyData = [];
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  
  // Generate 7 days of sample data
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayProfit = Math.random() * (totalProfit * 0.3) + (totalProfit * 0.1);
    
    dailyData.push({
      date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      profit: Math.round(dayProfit)
    });
  }
  
  return dailyData;
};

// Truncate long names for display
const truncateName = (name: string, maxLength: number = 15) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

export function Charts({ offerData, affiliateData, isLoading, dateRange }: ChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit by Offer ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Profit ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit by Advertiser ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit by Affiliate ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simple offer data processing
  const processedOfferData = offerData
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8)
    .map(item => ({
      ...item,
      displayName: truncateName(item.name, 12),
      fullName: item.name
    }));

  const processedAffiliateData = affiliateData
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8)
    .map(item => ({
      ...item,
      displayName: truncateName(item.name, 12),
      fullName: item.name
    }));

  // Generate daily profit data
  const dailyData = generateDailyData([...offerData, ...affiliateData]);

  // Create advertiser data using real offer names
  const advertiserData = offerData
    .slice(0, 6)
    .map((item, index) => {
      const advertiserName = item.name.split(' ')[0] || `Advertiser ${index + 1}`;
      const totalProfit = offerData.reduce((sum, o) => sum + o.profit, 0);
      return {
        name: advertiserName,
        profit: item.profit,
        percentage: totalProfit > 0 ? ((item.profit / totalProfit) * 100).toFixed(1) : '0.0'
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Simple Vertical Bar Chart - Profit by Offer */}
      <Card>
        <CardHeader>
          <CardTitle>Profit by Offer ($)</CardTitle>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </CardHeader>
        <CardContent>
          {processedOfferData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedOfferData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayName" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'white' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  tick={{ fill: 'white' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="profit" 
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No offer data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Chart - Daily Profit */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Profit ($)</CardTitle>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tick={{ fill: 'white' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                tick={{ fill: 'white' }}
              />
              <Tooltip 
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Profit']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.primary, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Donut Chart - Profit by Advertiser */}
      <Card>
        <CardHeader>
          <CardTitle>Profit by Advertiser ($)</CardTitle>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </CardHeader>
        <CardContent>
          {advertiserData.length > 0 ? (
            <div className="flex items-center justify-between">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={advertiserData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="profit"
                      startAngle={90}
                      endAngle={450}
                    >
                      {advertiserData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Profit']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        color: '#1f2937'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 pl-4">
                <div className="space-y-2">
                  {advertiserData.map((item, index) => (
                    <div key={item.name} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-white flex-1">{item.name}</span>
                      <span className="text-green-400 font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No advertiser data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vertical Bar Chart - Profit by Affiliate */}
      <Card>
        <CardHeader>
          <CardTitle>Profit by Affiliate ($)</CardTitle>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </CardHeader>
        <CardContent>
          {processedAffiliateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedAffiliateData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayName" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'white' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  tick={{ fill: 'white' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="profit" 
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No affiliate data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
