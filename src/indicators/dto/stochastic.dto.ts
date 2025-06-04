import { ApiProperty } from '@nestjs/swagger';

export class StochasticResponseDto {
  @ApiProperty({
    description: 'Масив значень %K (швидка лінія)',
    type: [Number],
    example: [75.5, 80.2, 85.1, 82.3, 78.9],
    additionalProperties: {
      description:
        'Значення коливаються від 0 до 100. Вище 80 - перекупленість, нижче 20 - перепроданість.',
    },
  })
  k: number[];

  @ApiProperty({
    description: 'Масив значень %D (повільна лінія)',
    type: [Number],
    example: [72.3, 75.8, 79.4, 81.2, 82.1],
    additionalProperties: {
      description:
        'Згладжена версія %K. Використовується для підтвердження сигналів.',
    },
  })
  d: number[];
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
    example: 'Недостатня кількість даних для розрахунку Stochastic',
  })
  message: string;

  @ApiProperty({
    description: 'Додаткова інформація про помилку',
    example: {
      indicator: 'Stochastic',
      requiredLength: 15,
      actualLength: 10,
      additionalInfo:
        'Для точного розрахунку рекомендується використовувати більше 100 елементів',
    },
  })
  details?: any;
}
