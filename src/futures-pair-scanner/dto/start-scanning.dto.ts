import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class StrategyParams {
  @ApiProperty()
  name: string;

  // @ApiProperty()
  // interval: string;

  // @ApiProperty()
  // minVolumeRatio: number;

  // @ApiProperty()
  // minConfidence: number;

  // @ApiProperty()
  // limit: number;
}

class StrategyDto {
  @ApiProperty()
  strategyType: string;

  @ApiProperty({ type: StrategyParams })
  params: StrategyParams;
}

export class StartScanningDto {
  @ApiProperty({
    description: "Назва ф'ючерсної пари (наприклад, BTCUSDT)",
    example: 'BTCUSDT',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Масив стратегій для сканування (опціонально)',
    type: [StrategyDto],
    required: false,
    example: [
      {
        strategyType: 'VOLUME_ANALYSIS',
        params: {
          name: 'Volume Ultra Aggressive 1m',
          interval: '1m',
          minVolumeRatio: 7.0,
          minConfidence: 0.98,
          limit: 15,
        },
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @Type(() => StrategyDto)
  strategies?: StrategyDto[];

  // params: FuturesPairParams;
}
