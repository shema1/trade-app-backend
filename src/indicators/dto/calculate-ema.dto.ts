import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, Min, MinLength } from 'class-validator';

export class CalculateEMADto {
  @ApiProperty({
    description: 'Масив цін для розрахунку EMA',
    type: [Number],
    example: [48000.0, 48250.0, 48120.0, 48380.0, 48450.0, 48600.0, 48500.0],
    minItems: 100,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @MinLength(100)
  prices: number[];

  @ApiProperty({
    description:
      'Період для розрахунку EMA. Визначає, скільки останніх значень використовуватиметься для розрахунку. Більший період дає більш плавну лінію, але з більшою затримкою.',
    type: Number,
    default: 14,
    minimum: 1,
    example: 14,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  period?: number = 14;
}
