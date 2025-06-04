import { ApiProperty } from '@nestjs/swagger';

export class RSIResponseDto {
  @ApiProperty({
    description: 'Масив значень RSI (Relative Strength Index)',
    type: [Number],
    example: [65.5, 68.8, 72.2, 75.5, 69.9],
    minimum: 0,
    maximum: 100,
  })
  rsi: number[];
}
