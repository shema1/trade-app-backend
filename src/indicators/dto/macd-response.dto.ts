import { ApiProperty } from '@nestjs/swagger';

export class MACDResponseDto {
  @ApiProperty({
    description: 'Масив значень MACD (різниця між швидкою та повільною EMA)',
    type: [Number],
    example: [250.5, 268.8, 282.2, 275.5, 269.9],
  })
  macd: number[];

  @ApiProperty({
    description: 'Масив значень сигнальної лінії (EMA від MACD)',
    type: [Number],
    example: [245.5, 258.8, 272.2, 265.5, 259.9],
  })
  signal: number[];

  @ApiProperty({
    description:
      'Масив значень гістограми (різниця між MACD та сигнальною лінією)',
    type: [Number],
    example: [5.0, 10.0, 10.0, 10.0, 10.0],
  })
  histogram: number[];
}
