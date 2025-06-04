import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientDataException extends HttpException {
  constructor(
    indicatorName: string,
    functionName: string,
    requiredLength: number,
    actualLength: number,
    additionalInfo?: string,
  ) {
    const message = additionalInfo
      ? `Помилка в функції ${functionName}: Для розрахунку ${indicatorName} потрібно мінімум ${requiredLength} елементів. Надано ${actualLength} елементів. ${additionalInfo}`
      : `Помилка в функції ${functionName}: Для розрахунку ${indicatorName} потрібно мінімум ${requiredLength} елементів. Надано ${actualLength} елементів.`;

    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Insufficient Data',
        message,
        details: {
          indicator: indicatorName,
          function: functionName,
          requiredLength,
          actualLength,
          additionalInfo,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
