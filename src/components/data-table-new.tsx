"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search } from "lucide-react";
import { ProfitData } from "@/hooks/useEverflowData";

interface DataTableProps {
  offerData: ProfitData[];
  affiliateData: ProfitData[];
  isLoading: boolean;
}

export function DataTable({ offerData, affiliateData, isLoading }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState<"offer" | "affiliate">("offer");
  const [sortBy, setSortBy] = useState<"profit" | "conversions" | "revenue">("profit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Combine and process data
  const currentData = groupBy === "offer" ? offerData : affiliateData;
  
  // Filter data based on search term
  const filteredData = currentData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportCSV = () => {
    const headers = ["Type", "Name", "ID", "Profit", "Revenue", "Payout", "Conversions"];
    const csvData = sortedData.map(item => [
      groupBy === "offer" ? "Offer" : "Affiliate",
      item.name,
      item.id,
      item.profit,
      item.revenue,
      item.payout,
      item.conversions
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${groupBy}-profits-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (column: "profit" | "conversions" | "revenue") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Data</CardTitle>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={groupBy} onValueChange={(value: "offer" | "affiliate") => setGroupBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="offer">Offers</SelectItem>
              <SelectItem value="affiliate">Affiliates</SelectItem>
            </SelectContent>
          </Select>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [col, order] = value.split('-');
            setSortBy(col as "profit" | "conversions" | "revenue");
            setSortOrder(order as "asc" | "desc");
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit-desc">Profit (High to Low)</SelectItem>
              <SelectItem value="profit-asc">Profit (Low to High)</SelectItem>
              <SelectItem value="conversions-desc">Conversions (High to Low)</SelectItem>
              <SelectItem value="conversions-asc">Conversions (Low to High)</SelectItem>
              <SelectItem value="revenue-desc">Revenue (High to Low)</SelectItem>
              <SelectItem value="revenue-asc">Revenue (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {sortedData.length} of {currentData.length} {groupBy === "offer" ? "offers" : "affiliates"}
          </p>
          <Badge variant="outline">
            {groupBy === "offer" ? "Grouped by Offer" : "Grouped by Affiliate"}
          </Badge>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("profit")}
                >
                  Profit {sortBy === "profit" && (sortOrder === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("revenue")}
                >
                  Revenue {sortBy === "revenue" && (sortOrder === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead>Payout</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("conversions")}
                >
                  Conversions {sortBy === "conversions" && (sortOrder === "desc" ? "↓" : "↑")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((item) => (
                  <TableRow key={`${groupBy}-${item.id}`}>
                    <TableCell>
                      <Badge variant={groupBy === "offer" ? "default" : "secondary"}>
                        {groupBy === "offer" ? "Offer" : "Affiliate"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate" title={item.name}>
                      {item.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.id}</TableCell>
                    <TableCell className={`font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.profit)}
                    </TableCell>
                    <TableCell>{formatCurrency(item.revenue)}</TableCell>
                    <TableCell>{formatCurrency(item.payout)}</TableCell>
                    <TableCell>{item.conversions.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No results found for your search." : `No ${groupBy} data available.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
