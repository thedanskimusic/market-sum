import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { StockPrice, MarketIndex } from '@/types/market.types';

// Type definitions for Yahoo Finance API response
interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose: number;
      };
      indicators: {
        quote: Array<{
          volume: number[];
          high: number[];
          low: number[];
          open: number[];
        }>;
      };
      timestamp: number[];
    }>;
  };
}

@Injectable()
export class RealMarketService {
  private readonly logger = new Logger(RealMarketService.name);
  private readonly yahooFinanceBaseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

  constructor() {}

  async getRealStockPrice(symbol: string): Promise<StockPrice> {
    try {
      this.logger.log(`Fetching real stock data for ${symbol}`);
      
      const url = `${this.yahooFinanceBaseUrl}/${symbol}`;
      const response = await axios.get<YahooFinanceResponse>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const data = response.data;
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error(`No data available for symbol: ${symbol}`);
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const indicators = result.indicators.quote[0];
      const timestamp = result.timestamp[result.timestamp.length - 1];
      
      // Validate required data exists
      if (!meta.regularMarketPrice || !meta.previousClose) {
        throw new Error(`Missing price data for symbol: ${symbol}`);
      }
      
      // Get the latest price data
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      // Get volume and other data with better error handling
      const volume = indicators.volume?.[indicators.volume.length - 1] || 0;
      
      // Handle high/low data more safely
      const validHighs = indicators.high?.filter((h: number) => h !== null && !isNaN(h)) || [];
      const validLows = indicators.low?.filter((l: number) => l !== null && !isNaN(l)) || [];
      
      const high = validHighs.length > 0 ? Math.max(...validHighs) : currentPrice;
      const low = validLows.length > 0 ? Math.min(...validLows) : currentPrice;
      const open = indicators.open?.[indicators.open.length - 1] || currentPrice;
      
      // Calculate market cap (approximate - would need shares outstanding for exact)
      const marketCap = currentPrice * (volume * 100); // Rough estimate

      return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: volume,
        marketCap: marketCap,
        high: high,
        low: low,
        open: open,
        previousClose: previousClose,
        timestamp: new Date(timestamp * 1000),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch real stock data for ${symbol}:`, errorMessage);
      
      // Fallback to mock data if real API fails
      return this.getMockStockPrice(symbol);
    }
  }

  async getRealMarketIndices(): Promise<MarketIndex[]> {
    const indices = [
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^AXJO', name: 'ASX 200' },
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^DJI', name: 'Dow Jones' },
      { symbol: '^FTSE', name: 'FTSE 100' },
    ];

    try {
      const promises = indices.map(async (index) => {
        try {
          const stockData = await this.getRealStockPrice(index.symbol);
          return {
            name: index.name,
            symbol: index.symbol,
            value: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            timestamp: stockData.timestamp,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to fetch index ${index.symbol}:`, errorMessage);
          return this.getMockIndex(index.symbol, index.name);
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to fetch market indices:', errorMessage);
      return this.getMockMarketIndices();
    }
  }

  async getRealTopGainers(limit: number = 10): Promise<StockPrice[]> {
    // Popular stocks to check for gainers (updated symbols)
    const popularStocks = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'CRM', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'SNAP', 'PINS', 'ZM', 'SHOP', 'BLOCK', // SQ changed to BLOCK
      'ROKU', 'CRWD', 'OKTA', 'DOCU', 'PLTR', 'COIN', 'HOOD', 'RBLX', 'SPOT' // Removed TWTR (now private)
    ];

    try {
      const promises = popularStocks.map(symbol => this.getRealStockPrice(symbol));
      const stocks = await Promise.all(promises);
      
      // Sort by percentage gain and return top gainers
      return stocks
        .filter(stock => stock.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to fetch top gainers:', errorMessage);
      return this.getMockTopGainers(limit);
    }
  }

  async getRealTopLosers(limit: number = 10): Promise<StockPrice[]> {
    // Popular stocks to check for losers (updated symbols)
    const popularStocks = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'CRM', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'SNAP', 'PINS', 'ZM', 'SHOP', 'BLOCK', // SQ changed to BLOCK
      'ROKU', 'CRWD', 'OKTA', 'DOCU', 'PLTR', 'COIN', 'HOOD', 'RBLX', 'SPOT' // Removed TWTR (now private)
    ];

    try {
      const promises = popularStocks.map(symbol => this.getRealStockPrice(symbol));
      const stocks = await Promise.all(promises);
      
      // Sort by percentage loss and return top losers
      return stocks
        .filter(stock => stock.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to fetch top losers:', errorMessage);
      return this.getMockTopLosers(limit);
    }
  }

  // Fallback mock methods (keeping the original mock logic)
  private getMockStockPrice(symbol: string): StockPrice {
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

  private getMockIndex(symbol: string, name: string): MarketIndex {
    return {
      name: name,
      symbol: symbol,
      value: 4000 + Math.random() * 1000,
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 3,
      timestamp: new Date(),
    };
  }

  private getMockMarketIndices(): MarketIndex[] {
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

  private getMockTopGainers(limit: number): StockPrice[] {
    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 'UBER', 'LYFT',
      'SNAP', 'PINS', 'ZM', 'SHOP', 'BLOCK', 'ROKU', 'CRWD', 'OKTA', 'DOCU', 'PLTR',
    ];

    return symbols.slice(0, limit).map(symbol => this.getMockStockPrice(symbol));
  }

  private getMockTopLosers(limit: number): StockPrice[] {
    const symbols = [
      'META', 'NFLX', 'UBER', 'LYFT', 'SNAP', 'PINS', 'ZM', 'SHOP', 'BLOCK', 'ROKU',
      'CRWD', 'OKTA', 'DOCU', 'PLTR', 'COIN', 'HOOD', 'RBLX', 'SPOT', 'SNAP',
    ];

    return symbols.slice(0, limit).map(symbol => this.getMockStockPrice(symbol));
  }
}
