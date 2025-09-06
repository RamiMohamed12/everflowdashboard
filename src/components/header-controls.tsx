"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

interface DateRange {
  start: string;
  end: string;
}

interface HeaderControlsProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExportCSV?: () => void;
  lastUpdated?: Date;
  isLoading?: boolean;
}

const datePresets = [
  { label: 'Today', value: 'today' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: 'MTD', value: 'mtd' },
  { label: 'YTD', value: 'ytd' },
];

export function HeaderControls({ 
  dateRange, 
  onDateRangeChange, 
  onRefresh, 
  onExportCSV,
  lastUpdated,
  isLoading = false 
}: HeaderControlsProps) {
  const handlePresetSelect = (preset: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (preset) {
      case 'today':
        start = today;
        break;
      case '7d':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'mtd':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    onDateRangeChange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-6 bg-card border-b">
      {/* Left side - Date controls */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date Range:</span>
          </div>
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="w-auto"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="w-auto"
          />
        </div>

        {/* Date presets */}
        <div className="flex gap-2">
          {datePresets.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Right side - Actions and status */}
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <Badge variant="outline" className="text-xs">
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </Badge>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={onExportCSV}
          disabled={isLoading}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
