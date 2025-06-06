import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { KlineCategory, KlineInterval } from './get-kline.dto';
import { Transform } from 'class-transformer';

export class GetKlineBatchDto {
  @ApiProperty({
    description: 'Символи торгових пар (наприклад, BTCUSDT, ETHUSDT)',
    default: ['BTCUSDT', 'ETHUSDT'],
    example: ['BTCUSDT', 'ETHUSDT'],
  })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];

  @ApiProperty({
    description:
      'Інтервал клін (1, 3, 5, 15, 30, 60, 120, 240, 360, 720, D, W, M)',
    default: '1',
    example: '15',
  })
  @IsEnum(KlineInterval)
  interval: KlineInterval;

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
  @Transform(({ value }) => Number(value))
  limit?: number;

  @ApiProperty({
    description: 'Категорія продукту (spot, linear, inverse)',
    default: 'linear',
    example: 'linear',
  })
  @IsEnum(KlineCategory)
  category: KlineCategory;
}
