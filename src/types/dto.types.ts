import { IsString, IsNumber, IsOptional, IsArray, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetStockPriceDto {
  @ApiProperty({ description: 'Stock symbol (e.g., AAPL, MSFT)' })
  @IsString()
  symbol!: string;
}

export class GetMarketSummaryDto {
  @ApiPropertyOptional({ description: 'Number of items to return', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;
}

export class GetNewsDto {
  @ApiPropertyOptional({ description: 'Search query for news articles' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'News source filter' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Number of articles to return', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Start date for news filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for news filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateWatchlistDto {
  @ApiProperty({ description: 'Name of the watchlist' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Array of stock symbols to watch' })
  @IsArray()
  @IsString({ each: true })
  symbols!: string[];

  @ApiPropertyOptional({ description: 'Description of the watchlist' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateWatchlistDto {
  @ApiPropertyOptional({ description: 'Name of the watchlist' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Array of stock symbols to watch' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symbols?: string[];

  @ApiPropertyOptional({ description: 'Description of the watchlist' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateAlertDto {
  @ApiProperty({ description: 'Stock symbol for the alert' })
  @IsString()
  symbol!: string;

  @ApiProperty({ description: 'Target price for the alert' })
  @IsNumber()
  targetPrice!: number;

  @ApiProperty({ description: 'Type of alert', enum: ['above', 'below'] })
  @IsEnum(['above', 'below'])
  type!: 'above' | 'below';

  @ApiPropertyOptional({ description: 'Description of the alert' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class LoginDto {
  @ApiProperty({ description: 'User email' })
  @IsString()
  email!: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'User email' })
  @IsString()
  email!: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password!: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  lastName!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken!: string;
}
