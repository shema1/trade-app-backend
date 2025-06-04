import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientDataException extends HttpException {
  constructor(requiredLength: number, actualLength: number) {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Insufficient Data',
        message: `Для розрахунку RSI потрібно мінімум ${requiredLength} елементів. Надано ${actualLength} елементів.`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
