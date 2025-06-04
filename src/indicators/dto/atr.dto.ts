import { ApiProperty } from '@nestjs/swagger';

export class ATRResponseDto {
  @ApiProperty({
    description: 'Масив значень ATR (Average True Range)',
    type: [Number],
    example: [250.5, 268.8, 282.2, 275.5, 269.9],
    additionalProperties: {
      description:
        'Кожне значення представляє середній діапазон ціни. Більші значення вказують на більшу волатильність, менші - на меншу волатильність.',
    },
  })
  atr: number[];
}
