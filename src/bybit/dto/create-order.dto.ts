import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnalysisResultRecommendation } from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

export enum OrderSide {
  Buy = 'Buy',
  Sell = 'Sell',
}

export enum OrderType {
  Limit = 'Limit',
  Market = 'Market',
}

export enum TimeInForce {
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK',
  PostOnly = 'PostOnly',
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Торгова пара (наприклад: BTCUSDT, ETHUSDT)',
    example: 'BTCUSDT',
    minLength: 1,
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Сторона ордера (BUY або SELL)',
    enum: AnalysisResultRecommendation,
    example: AnalysisResultRecommendation.BUY,
  })
  @IsEnum(AnalysisResultRecommendation)
  side: AnalysisResultRecommendation;

  @ApiProperty({
    description: 'Розмір ставки в USDT',
    example: 100,
    minimum: 0.01,
  })
  @IsNumber()
  betSize: number;

  @ApiProperty({
    description: 'Відсоток take profit (наприклад: 2.5 означає 2.5%)',
    example: 2.5,
    minimum: 0.01,
    maximum: 100,
  })
  @IsNumber()
  takeProfit: number;

  @ApiProperty({
    description: 'Відсоток stop loss (наприклад: 1.0 означає 1.0%)',
    example: 1.0,
    minimum: 0.01,
    maximum: 100,
  })
  @IsNumber()
  stopLoss: number;

  @ApiProperty({
    description: 'Поточна ціна активу для розрахунку кількості',
    example: 45000,
    minimum: 0.01,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Час дії ордера (опціонально)',
    enum: TimeInForce,
    example: TimeInForce.GTC,
    required: false,
  })
  @IsOptional()
  @IsEnum(TimeInForce)
  timeInForce?: TimeInForce;

  @ApiProperty({
    description: 'Плече (1-100)',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  leverage?: number;

  @ApiProperty({
    description: 'Ціна спрацьовування для умовних ордерів (опціонально)',
    example: '45000',
    required: false,
  })
  @IsOptional()
  @IsString()
  triggerPrice?: string;
}
