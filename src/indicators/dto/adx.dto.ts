import { ApiProperty } from '@nestjs/swagger';

export class ADXResponseDto {
  @ApiProperty({
    description: 'Масив значень ADX (Average Directional Index)',
    type: [Number],
    example: [25.5, 26.8, 28.2, 27.5, 26.9],
    additionalProperties: {
      description:
        'Кожне значення представляє силу тренду. Значення вище 25 вказують на сильний тренд, вище 50 - на дуже сильний тренд.',
    },
  })
  adx: number[];
}
