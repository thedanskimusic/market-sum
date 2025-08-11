import {
  Controller,
  Get,
  Query,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MarketService } from './market.service';
import { GetMarketSummaryDto } from '@/types/dto.types';
import {
  StockPrice,
  MarketIndex,
  MarketSummary,
  ApiResponse as ApiResponseType,
} from '@/types/market.types';

@ApiTags('market')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('stock/:symbol')
  @ApiOperation({ summary: 'Get stock price for a specific symbol' })
  @ApiParam({ name: 'symbol', description: 'Stock symbol (e.g., AAPL, MSFT)' })
  @ApiResponse({
    status: 200,
    description: 'Stock price data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { $ref: '#/components/schemas/StockPrice' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid symbol provided',
  })
  async getStockPrice(
    @Param('symbol') symbol: string,
  ): Promise<ApiResponseType<StockPrice>> {
    try {
      if (!symbol || symbol.trim().length === 0) {
        throw new HttpException(
          'Symbol is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.marketService.getStockPrice(symbol.trim());
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock price';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('indices')
  @ApiOperation({ summary: 'Get market indices data' })
  @ApiResponse({
    status: 200,
    description: 'Market indices data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: { $ref: '#/components/schemas/MarketIndex' }
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getMarketIndices(): Promise<ApiResponseType<MarketIndex[]>> {
    try {
      const data = await this.marketService.getMarketIndices();
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch market indices';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get comprehensive market summary' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Market summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { $ref: '#/components/schemas/MarketSummary' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getMarketSummary(
    @Query() _query: GetMarketSummaryDto,
  ): Promise<ApiResponseType<MarketSummary>> {
    try {
      const data = await this.marketService.getMarketSummary();
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch market summary';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('gainers')
  @ApiOperation({ summary: 'Get top gaining stocks' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of stocks to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Top gainers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: { $ref: '#/components/schemas/StockPrice' }
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getTopGainers(
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseType<StockPrice[]>> {
    try {
      const data = await this.marketService.getTopGainers(limit);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top gainers';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('losers')
  @ApiOperation({ summary: 'Get top losing stocks' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of stocks to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Top losers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: { $ref: '#/components/schemas/StockPrice' }
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getTopLosers(
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseType<StockPrice[]>> {
    try {
      const data = await this.marketService.getTopLosers(limit);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top losers';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('australia')
  @ApiOperation({ summary: 'Get Australian market data including ASX indices and major stocks' })
  @ApiResponse({
    status: 200,
    description: 'Australian market data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            asxIndices: {
              type: 'array',
              items: { $ref: '#/components/schemas/MarketIndex' }
            },
            topAsxGainers: {
              type: 'array',
              items: { $ref: '#/components/schemas/StockPrice' }
            },
            topAsxLosers: {
              type: 'array',
              items: { $ref: '#/components/schemas/StockPrice' }
            },
            majorAsxStocks: {
              type: 'array',
              items: { $ref: '#/components/schemas/StockPrice' }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getAustralianMarketData(): Promise<ApiResponseType<{
    asxIndices: MarketIndex[];
    topAsxGainers: StockPrice[];
    topAsxLosers: StockPrice[];
    majorAsxStocks: StockPrice[];
  }>> {
    try {
      const data = await this.marketService.getAustralianMarketData();
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Australian market data';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
