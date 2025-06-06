import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { KlineIntervalV3 } from 'bybit-api';

export enum KlineCategory {
  SPOT = 'spot',
  LINEAR = 'linear',
  INVERSE = 'inverse',
}

export enum KlineInterval {
  ONE_MINUTE = '1',
  THREE_MINUTES = '3',
  FIVE_MINUTES = '5',
  FIFTEEN_MINUTES = '15',
  THIRTY_MINUTES = '30',
  ONE_HOUR = '60',
  TWO_HOURS = '120',
  FOUR_HOURS = '240',
  SIX_HOURS = '360',
  TWELVE_HOURS = '720',
  ONE_DAY = 'D',
  ONE_WEEK = 'W',
  ONE_MONTH = 'M',
}

export class GetKlineDto {
  @ApiProperty({
    description: 'Символ торгової пари (наприклад, BTCUSDT)',
    default: 'BTCUSDT',
    example: 'BTCUSDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description:
      'Інтервал клін (1, 3, 5, 15, 30, 60, 120, 240, 360, 720, D, W, M)',
    default: '1',
    example: '15',
  })
  @IsEnum(KlineInterval)
  interval: KlineIntervalV3;

  @ApiProperty({
    description: 'Кількість клін для отримання (макс. 1000)',
    default: 200,
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiProperty({
    description: 'Категорія продукту (spot, linear, inverse)',
    default: 'linear',
    example: 'linear',
  })
  @IsEnum(KlineCategory)
  category: KlineCategory;
}
