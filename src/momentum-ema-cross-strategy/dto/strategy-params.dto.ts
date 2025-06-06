import { ApiProperty } from '@nestjs/swagger';
import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { KlineDataItem } from 'src/bybit/interfaces/responses.interface';

export class MomentumEmaStrategyParamsDto {
  @ApiProperty({ example: 'BTCUSDT', default: 'BTCUSDT' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ example: '60', default: '60' })
  @IsEnum(KlineInterval)
  @IsNotEmpty()
  interval: KlineInterval;

  @ApiProperty({ example: [], default: [], required: false })
  @IsArray()
  @IsOptional()
  kline: KlineDataItem[];

  @ApiProperty({ example: 200, default: 200 })
  @IsNumber()
  limit: number;

  @ApiProperty({ example: 0.7, default: 0.7 })
  @IsNumber()
  @IsNotEmpty()
  minPriceChangePercent: number;

  @ApiProperty({ example: 25, default: 25 })
  @IsNumber()
  @IsNotEmpty()
  minAdxStrength: number;

  @ApiProperty({ example: 0.7, default: 0.7 })
  @IsNumber()
  @IsNotEmpty()
  minVolatilityPercent: number;

  @ApiProperty({ example: 9, default: 9 })
  @IsNumber()
  @IsNotEmpty()
  emaShortPeriod: number;

  @ApiProperty({ example: 21, default: 21 })
  @IsNumber()
  @IsNotEmpty()
  emaLongPeriod: number;

  @ApiProperty({ example: 5, default: 5 })
  @IsNumber()
  @IsNotEmpty()
  maxAtrPercent: number;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsNotEmpty()
  trendOnly: boolean;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsNotEmpty()
  dynamicAtrFilter: boolean;

  @ApiProperty({ example: 0.75, default: 0.75 })
  @IsNumber()
  @IsNotEmpty()
  confidenceValue: number;
}

export const DEFAULT_STRATEGY_PARAMS = {
  minPriceChangePercent: 0.7,
  minAdxStrength: 25,
  minVolatilityPercent: 0.7,
  emaShortPeriod: 9,
  emaLongPeriod: 21,
  maxAtrPercent: 5,
  trendOnly: true,
  dynamicAtrFilter: true,
  confidenceValue: 0.75,
  limit: 50,
};
