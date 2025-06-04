import { ApiProperty } from '@nestjs/swagger';

export class CalculateMACDDto {
  @ApiProperty({
    description: 'Масив цін для розрахунку MACD',
    example: [
      67000, 67150, 67220, 67300, 67400, 67550, 67620, 67480, 67300, 67500,
      67800, 68050, 67900, 67700, 67500, 67400, 67350, 67200, 67100, 67050,
      66900, 66800, 66750, 66600, 66500, 66450, 66300, 66200, 66150, 66000,
      65900, 65850, 65700, 65600, 65550, 65400, 65300, 65250, 65100, 65000,
    ],
    type: [Number],
  })
  prices: number[];

  @ApiProperty({
    description: 'Період швидкої EMA (за замовчуванням 12)',
    example: 12,
    required: false,
    type: Number,
  })
  fastPeriod?: number;

  @ApiProperty({
    description: 'Період повільної EMA (за замовчуванням 26)',
    example: 26,
    required: false,
    type: Number,
  })
  slowPeriod?: number;

  @ApiProperty({
    description: 'Період сигнальної лінії (за замовчуванням 9)',
    example: 9,
    required: false,
    type: Number,
  })
  signalPeriod?: number;
}
