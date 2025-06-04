import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CalculateATRDto {
  @ApiProperty({
    description: 'Масив максимальних цін',
    type: [Number],
    example: [48000.0, 48250.0, 48120.0, 48300.0, 48400.0],
    minItems: 15,
    additionalProperties: {
      description:
        'Мінімальна кількість елементів: period + 1 (за замовчуванням 15). Для точного розрахунку рекомендується використовувати більше 100 елементів.',
    },
  })
  @IsArray()
  @ArrayMinSize(15)
  high: number[];

  @ApiProperty({
    description: 'Масив мінімальних цін',
    type: [Number],
    example: [47500.0, 47600.0, 47700.0, 47800.0, 47900.0],
    minItems: 15,
  })
  @IsArray()
  @ArrayMinSize(15)
  low: number[];

  @ApiProperty({
    description: 'Масив цін закриття',
    type: [Number],
    example: [47800.0, 47900.0, 48000.0, 48100.0, 48200.0],
    minItems: 15,
  })
  @IsArray()
  @ArrayMinSize(15)
  close: number[];

  @ApiProperty({
    description: 'Період для розрахунку ATR',
    type: Number,
    default: 14,
    minimum: 1,
    maximum: 100,
    example: 14,
    additionalProperties: {
      description:
        'Впливає на чутливість індикатора. Менші значення дають більш чутливий індикатор, але можуть призводити до більшої кількості хибних сигналів. Більші значення дають більш плавний індикатор, але з затримкою сигналів. Рекомендований діапазон: 5-100.',
    },
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  period?: number = 14;
}
