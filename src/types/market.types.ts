export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export interface CommodityPrice {
  name: string;
  symbol: string;
  price: number;
  unit: string;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface EconomicIndicator {
  name: string;
  value: number;
  unit: string;
  period: string;
  change?: number;
  changePercent?: number;
  timestamp: Date;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  author?: string;
  tags: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface MarketSummary {
  timestamp: Date;
  indices: MarketIndex[];
  topGainers: StockPrice[];
  topLosers: StockPrice[];
  mostActive: StockPrice[];
  currencies: CurrencyRate[];
  commodities: CommodityPrice[];
  economicIndicators: EconomicIndicator[];
  news: NewsArticle[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: Date;
  path: string;
}
