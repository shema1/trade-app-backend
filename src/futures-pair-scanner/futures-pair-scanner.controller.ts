import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FuturesPairScannerService } from './futures-pair-scanner.service';
import { StartScanningDto } from './dto/start-scanning.dto';
import { FuturesPair } from './schemas/futures-pair.schema';

@ApiTags('Futures Pair Scanner')
@Controller('futures-pair-scanner')
export class FuturesPairScannerController {
  constructor(
    private readonly futuresPairScannerService: FuturesPairScannerService,
  ) {}

  @Post('start-scanning')
  @ApiOperation({
    summary: "Запустити сканування ф'ючерсної пари",
    description: `
    Запускає процес сканування ф'ючерсної пари з використанням різних стратегій.
    
    Особливості:
    - Автоматично створює новий запис ф'ючерсної пари в базі даних
    - Запускає безперервне сканування з інтервалом 2 хвилини
    - Використовує набір стратегій для різних часових інтервалів
    - Зберігає результати аналізу в базу даних
    - Має вбудований механізм паузи між сигналами (30 хвилин)
    
    Стратегії включають:
    - Volume Analysis
    - Momentum EMA Cross
    - Різні часові інтервали (1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 1w, 1M)
    
    Параметри стратегій:
    - minVolumeRatio: від 2.5 до 7.0
    - minConfidence: від 0.6 до 0.98
    - limit: від 15 до 300
    
    Типи стратегій:
    - Ultra Aggressive
    - Super Scalping
    - Mega Breakout
    - Trend Master
    - Volatility Master
    - Reversal Master
    - Accumulation Master
    - Distribution Master
    - Position Master
    - Range Master
    `,
  })
  @ApiBody({
    type: StartScanningDto,
    description: 'Параметри для запуску сканування',
    examples: {
      example1: {
        value: {
          name: 'BTCUSDT',
        },
        summary: 'Запуск сканування для BTCUSDT',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Сканування успішно запущено',
    type: FuturesPair,
  })
  @ApiResponse({
    status: 400,
    description: 'Невірні параметри запиту',
  })
  @ApiResponse({
    status: 500,
    description: 'Внутрішня помилка сервера',
  })
  async startScanning(
    @Body() data: StartScanningDto,
  ): Promise<FuturesPair | null> {
    return this.futuresPairScannerService.startScanning(data);
  }
}
