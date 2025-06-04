import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CalculateBollingerBandsDto {
  @ApiProperty({
    description: 'Масив цін для розрахунку смуг Боллінджера',
    type: [Number],
    example: [48000.0, 48250.0, 48120.0, 48380.0, 48450.0, 48600.0, 48500.0],
    minItems: 100,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @MinLength(100)
  prices: number[];

  @ApiProperty({
    description: `Період для розрахунку ковзної середньої.
    - Визначає період для розрахунку SMA
    - Більший період дає більш плавні смуги, але з більшою затримкою
    - Стандартне значення 20 добре працює для більшості випадків
    - Рекомендований діапазон: 10-50`,
    type: Number,
    default: 20,
    minimum: 10,
    maximum: 50,
    example: 20,
  })
  @IsNumber()
  @Min(10)
  @Max(50)
  @IsOptional()
  period?: number = 20;

  @ApiProperty({
    description: `Множник стандартного відхилення.
    - Визначає ширину смуг
    - Більше значення = ширші смуги
    - Менше значення = вужчі смуги
    - Стандартне значення 2 охоплює ~95% цінових рухів
    - Рекомендований діапазон: 1.5-3`,
    type: Number,
    default: 2,
    minimum: 1.5,
    maximum: 3,
    example: 2,
  })
  @IsNumber()
  @Min(1.5)
  @Max(3)
  @IsOptional()
  stddev?: number = 2;
}
