import { Injectable } from '@nestjs/common';
import { StockPrice, MarketIndex, MarketSummary } from '@/types/market.types';

@Injectable()
export class MarketService {
  constructor() {}

  async getStockPrice(symbol: string): Promise<StockPrice> {
    // Mock data for now - will be replaced with real API calls
    const mockPrice = Math.random() * 1000 + 50;
    const mockChange = (Math.random() - 0.5) * 20;
    const mockChangePercent = (mockChange / (mockPrice - mockChange)) * 100;

    return {
      symbol: symbol.toUpperCase(),
      price: mockPrice,
      change: mockChange,
      changePercent: mockChangePercent,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000),
      high: mockPrice + Math.random() * 10,
      low: mockPrice - Math.random() * 10,
      open: mockPrice - mockChange,
      previousClose: mockPrice - mockChange,
      timestamp: new Date(),
    };
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    // Mock market indices data
    return [
      {
        name: 'S&P 500',
        symbol: '^GSPC',
        value: 4500 + Math.random() * 100,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 2,
        timestamp: new Date(),
      },
      {
        name: 'ASX 200',
        symbol: '^AXJO',
        value: 7000 + Math.random() * 200,
        change: (Math.random() - 0.5) * 30,
        changePercent: (Math.random() - 0.5) * 1.5,
        timestamp: new Date(),
      },
      {
        name: 'NASDAQ',
        symbol: '^IXIC',
        value: 14000 + Math.random() * 300,
        change: (Math.random() - 0.5) * 100,
        changePercent: (Math.random() - 0.5) * 3,
        timestamp: new Date(),
      },
    ];
  }

  async getMarketSummary(): Promise<MarketSummary> {
    const indices = await this.getMarketIndices();
    const topGainers = await Promise.all(
      ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'].map((symbol) =>
        this.getStockPrice(symbol),
      ),
    );
    const topLosers = await Promise.all(
      ['META', 'NFLX', 'UBER', 'LYFT', 'SNAP'].map((symbol) =>
        this.getStockPrice(symbol),
      ),
    );

    return {
      timestamp: new Date(),
      indices,
      topGainers: topGainers.sort((a, b) => b.changePercent - a.changePercent),
      topLosers: topLosers.sort((a, b) => a.changePercent - b.changePercent),
      mostActive: topGainers.sort((a, b) => b.volume - a.volume),
      currencies: [],
      commodities: [],
      economicIndicators: [],
      news: [],
    };
  }

  async getTopGainers(limit: number = 10): Promise<StockPrice[]> {
    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 'UBER', 'LYFT',
      'SNAP', 'PINS', 'ZM', 'SHOP', 'SQ', 'ROKU', 'CRWD', 'OKTA', 'ZM', 'DOCU',
    ];

    const stocks = await Promise.all(
      symbols.slice(0, limit).map((symbol) => this.getStockPrice(symbol)),
    );

    return stocks.sort((a, b) => b.changePercent - a.changePercent);
  }

  async getTopLosers(limit: number = 10): Promise<StockPrice[]> {
    const symbols = [
      'META', 'NFLX', 'UBER', 'LYFT', 'SNAP', 'PINS', 'ZM', 'SHOP', 'SQ', 'ROKU',
      'CRWD', 'OKTA', 'DOCU', 'PLTR', 'COIN', 'HOOD', 'RBLX', 'SPOT', 'TWTR', 'SNAP',
    ];

    const stocks = await Promise.all(
      symbols.slice(0, limit).map((symbol) => this.getStockPrice(symbol)),
    );

    return stocks.sort((a, b) => a.changePercent - b.changePercent);
  }
}
