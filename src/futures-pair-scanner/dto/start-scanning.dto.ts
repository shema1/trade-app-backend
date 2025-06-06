import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartScanningDto {
  @ApiProperty({
    description: 'Назва сканування',
    example: 'BTC Futures Scanner',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // strategies: FuturesPairStrategy[];

  // params: FuturesPairParams;
}
