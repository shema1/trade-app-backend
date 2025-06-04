import { ApiProperty } from '@nestjs/swagger';

export class CalculateRSIDto {
  @ApiProperty({
    description: 'Масив цін для розрахунку RSI',
    example: [
      48000.0, 48250.0, 48120.0, 48380.0, 48450.0, 48600.0, 48500.0, 48750.0,
      48800.0, 48950.0, 48800.0, 49000.0, 49150.0, 49200.0, 49100.0, 49300.0,
      49450.0, 49500.0, 49600.0, 49750.0, 49600.0, 49550.0, 49680.0, 49800.0,
      49900.0,
    ],
    type: [Number],
  })
  prices: number[];

  @ApiProperty({
    description: 'Період для розрахунку RSI (за замовчуванням 14)',
    example: 14,
    required: false,
    type: Number,
  })
  period?: number;
}
