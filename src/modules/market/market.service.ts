import { Injectable } from '@nestjs/common';
import { StockPrice, MarketIndex, MarketSummary } from '@/types/market.types';
import { RealMarketService } from './real-market.service';

@Injectable()
export class MarketService {
  constructor(private readonly realMarketService: RealMarketService) {}

  async getStockPrice(symbol: string): Promise<StockPrice> {
    return this.realMarketService.getRealStockPrice(symbol);
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    return this.realMarketService.getRealMarketIndices();
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
    return this.realMarketService.getRealTopGainers(limit);
  }

  async getTopLosers(limit: number = 10): Promise<StockPrice[]> {
    return this.realMarketService.getRealTopLosers(limit);
  }
}
