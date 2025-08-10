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
import { NewsService } from './news.service';
import { GetNewsDto } from '@/types/dto.types';
import {
  NewsArticle,
  ApiResponse as ApiResponseType,
} from '@/types/market.types';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get latest financial news' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of articles to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'News articles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: { $ref: '#/components/schemas/NewsArticle' }
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getLatestNews(
    @Query() query: GetNewsDto,
  ): Promise<ApiResponseType<NewsArticle[]>> {
    try {
      const data = await this.newsService.getLatestNews(query.limit);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search news articles' })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search term',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of articles to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'News search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: { $ref: '#/components/schemas/NewsArticle' }
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async searchNews(
    @Query('query') query: string,
    @Query('limit') limit: number = 20,
  ): Promise<ApiResponseType<NewsArticle[]>> {
    try {
      if (!query || query.trim().length === 0) {
        throw new HttpException(
          'Search query is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.newsService.searchNews(query.trim(), limit);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search news';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get news by category' })
  @ApiParam({ name: 'category', description: 'News category (business, technology, markets, economy)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of articles to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Category news retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: { $ref: '#/components/schemas/NewsArticle' }
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getNewsByCategory(
    @Param('category') category: string,
    @Query('limit') limit: number = 20,
  ): Promise<ApiResponseType<NewsArticle[]>> {
    try {
      if (!category || category.trim().length === 0) {
        throw new HttpException(
          'Category is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.newsService.getNewsByCategory(category.trim(), limit);
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category news';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
