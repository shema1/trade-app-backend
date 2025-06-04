import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CalculateSMADto {
  @ApiProperty({
    description: 'Масив цін для розрахунку Simple Moving Average (SMA)',
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
  prices: number[];

  @ApiProperty({
    description: 'Період для розрахунку SMA',
    type: Number,
    default: 14,
    minimum: 1,
    maximum: 200,
    example: 14,
    additionalProperties: {
      description:
        'Впливає на чутливість індикатора. Менші значення дають більш чутливий індикатор, але можуть призводити до більшої кількості хибних сигналів. Більші значення дають більш плавний індикатор, але з затримкою сигналів. Рекомендований діапазон: 5-200.',
    },
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  period?: number = 14;
}
