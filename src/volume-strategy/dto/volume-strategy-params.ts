import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { KlineCategory, KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { KlineDataItem } from 'src/bybit/interfaces/responses.interface';

export class VolumeStrategyParamsDto {
  @ApiProperty({ example: 'BTCUSDT', default: 'BTCUSDT' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ example: '1', default: '1' })
  @IsEnum(KlineInterval)
  @IsNotEmpty()
  interval: KlineInterval;

  @ApiProperty({ example: [], default: [], required: false })
  @IsArray()
  @IsOptional()
  kline: KlineDataItem[];

  @ApiProperty({ example: 200, default: 200 })
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @ApiProperty({ example: 2.5, default: 2.5 })
  @IsNumber()
  @IsNotEmpty()
  minVolumeRatio: number;

  @ApiProperty({ example: 0.75, default: 0.75 })
  @IsNumber()
  @IsNotEmpty()
  minConfidence: number;

  @ApiProperty({ example: KlineCategory.LINEAR, default: KlineCategory.LINEAR })
  @IsEnum(KlineCategory)
  @IsOptional()
  category: KlineCategory;
}
