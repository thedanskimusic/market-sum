import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { RealMarketService } from './real-market.service';

@Module({
  controllers: [MarketController],
  providers: [MarketService, RealMarketService],
  exports: [MarketService],
})
export class MarketModule {}
