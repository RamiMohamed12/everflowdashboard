// Mock data for the dashboard

export interface KPIData {
  totalProfit: number;
  offersWithProfit: number;
  affiliatesWithProfit: number;
  eCPA?: number;
  margin?: number;
}

export interface ChartData {
  name: string;
  profit: number;
  id?: string;
}

export interface TableDataItem {
  id: string;
  name: string;
  type: 'offer' | 'affiliate';
  profit: number;
  conversions?: number;
}

export const mockKPIData: KPIData = {
  totalProfit: 245760,
  offersWithProfit: 23,
  affiliatesWithProfit: 156,
  eCPA: 45.20,
  margin: 32.5,
};

export const mockPreviousKPIData: KPIData = {
  totalProfit: 198450,
  offersWithProfit: 19,
  affiliatesWithProfit: 142,
  eCPA: 52.10,
  margin: 28.3,
};

export const mockOfferData: ChartData[] = [
  { name: "Premium Gaming Offer", profit: 45230, id: "OFR-001" },
  { name: "Health & Wellness", profit: 38750, id: "OFR-002" },
  { name: "Finance CPA", profit: 32100, id: "OFR-003" },
  { name: "E-commerce Deal", profit: 28900, id: "OFR-004" },
  { name: "Travel Booking", profit: 25600, id: "OFR-005" },
  { name: "Education Platform", profit: 22400, id: "OFR-006" },
  { name: "Crypto Exchange", profit: 19800, id: "OFR-007" },
  { name: "Software Suite", profit: 17300, id: "OFR-008" },
  { name: "Dating App", profit: 15100, id: "OFR-009" },
  { name: "Streaming Service", profit: 12400, id: "OFR-010" },
];

export const mockAffiliateData: ChartData[] = [
  { name: "SuperAffiliate Pro", profit: 52100, id: "AFF-001" },
  { name: "Marketing Ninja", profit: 41200, id: "AFF-002" },
  { name: "Digital Dynamo", profit: 35800, id: "AFF-003" },
  { name: "Conversion King", profit: 31400, id: "AFF-004" },
  { name: "Traffic Master", profit: 28700, id: "AFF-005" },
  { name: "Lead Legend", profit: 24900, id: "AFF-006" },
  { name: "Performance Pro", profit: 22100, id: "AFF-007" },
  { name: "Revenue Rocket", profit: 19600, id: "AFF-008" },
  { name: "Growth Guru", profit: 17800, id: "AFF-009" },
  { name: "Scale Specialist", profit: 15300, id: "AFF-010" },
];

export const mockTableData: TableDataItem[] = [
  // Offers
  ...mockOfferData.map((offer, index) => ({
    id: offer.id || `OFR-${(index + 1).toString().padStart(3, '0')}`,
    name: offer.name,
    type: 'offer' as const,
    profit: offer.profit,
    conversions: Math.floor(Math.random() * 500) + 50,
  })),
  // Affiliates
  ...mockAffiliateData.map((affiliate, index) => ({
    id: affiliate.id || `AFF-${(index + 1).toString().padStart(3, '0')}`,
    name: affiliate.name,
    type: 'affiliate' as const,
    profit: affiliate.profit,
    conversions: Math.floor(Math.random() * 300) + 20,
  })),
];

export const getDateRangeString = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (start === end) {
    return startDate.toLocaleDateString();
  }
  
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};
