import { start } from "repl";

export type GroupBy = 'offer' | 'affiliate' | 'advertiser';

export type NormlizdRow = { 
    id: string; 
    name: string;
    profit: number; 
}; 

export type StatsResponse = { 
 rows: NormlizdRow[];
  meta: {
    start: string;
    end: string;
    groupBy: GroupBy;
    fetchedAt: string;
  };   
}

export type DateRang = { 
    start: string; 
    end: string; 
}