import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP статус код помилки',
    type: Number,
    example: 400,
  })
  status: number;

  @ApiProperty({
    description: 'Тип помилки',
    type: String,
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: 'Детальне повідомлення про помилку',
    type: String,
    example: 'Недостатня кількість даних для розрахунку',
  })
  message: string;

  @ApiProperty({
    description: 'Додаткова інформація про помилку',
    type: Object,
    example: {
      indicator: 'MACD',
      function: 'calculateMACD',
      requiredLength: 100,
      actualLength: 50,
      additionalInfo:
        'Для точного розрахунку MACD рекомендується використовувати 100-200 елементів.',
    },
  })
  details?: Record<string, any>;
}
