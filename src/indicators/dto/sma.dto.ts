import { ApiProperty } from '@nestjs/swagger';

export class SMAResponseDto {
  @ApiProperty({
    description: 'Масив значень Simple Moving Average (SMA)',
    type: [Number],
    example: [48000.0, 48100.0, 48150.0, 48200.0, 48250.0],
    additionalProperties: {
      description:
        'Кожне значення представляє середню ціну за вказаний період. Використовується для визначення тренду та потенційних рівнів підтримки/опору.',
    },
  })
  sma: number[];
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP статус код помилки',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Тип помилки',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: 'Детальний опис помилки',
    example: 'Недостатня кількість даних для розрахунку SMA',
  })
  message: string;

  @ApiProperty({
    description: 'Додаткова інформація про помилку',
    example: {
      indicator: 'SMA',
      requiredLength: 15,
      actualLength: 10,
      additionalInfo:
        'Для точного розрахунку рекомендується використовувати більше 100 елементів',
    },
  })
  details?: any;
}
