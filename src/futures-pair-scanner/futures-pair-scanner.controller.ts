import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FuturesPairScannerService } from './futures-pair-scanner.service';
import { StartScanningDto } from './dto/start-scanning.dto';
import { FuturesPair, FuturesPairStatus } from './schemas/futures-pair.schema';

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

  @Get('get-future-pair-by-id/:id')
  async getFuturePairById(
    @Param('id') id: string,
  ): Promise<FuturesPair | null> {
    return this.futuresPairScannerService.getFuturePairById(id);
  }

  @Post('resume-scanning/:id')
  @ApiOperation({
    summary: "Продовжити сканування ф'ючерсної пари",
    description: `
    Продовжує сканування ф'ючерсної пари, яка була раніше зупинена.
    
    Умови для продовження:
    - Запис повинен існувати в базі даних
    - Статус повинен бути STOPPED
    - Сканування не повинно бути вже активним
    
    Після успішного продовження:
    - Статус змінюється на ACTIVE
    - Запускається безперервне сканування
    - Оновлюється час останнього сканування
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Сканування успішно продовжено',
    type: FuturesPair,
  })
  @ApiResponse({
    status: 400,
    description: 'Неможливо продовжити сканування',
  })
  @ApiResponse({
    status: 404,
    description: "Ф'ючерсна пара не знайдена",
  })
  async resumeScanning(@Param('id') id: string): Promise<FuturesPair | null> {
    return this.futuresPairScannerService.resumeScanning(id);
  }

  @Post('stop-scanning/:id')
  @ApiOperation({
    summary: "Зупинити сканування ф'ючерсної пари",
    description: `
    Зупиняє активне сканування ф'ючерсної пари.
    
    Після зупинки:
    - Статус змінюється на STOPPED
    - Задача видаляється з активних сканувань
    - Оновлюється час останнього сканування
    - Сканування можна продовжити пізніше
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Сканування успішно зупинено',
    type: FuturesPair,
  })
  @ApiResponse({
    status: 400,
    description: 'Сканування не активне',
  })
  @ApiResponse({
    status: 404,
    description: "Ф'ючерсна пара не знайдена",
  })
  async stopScanning(@Param('id') id: string): Promise<FuturesPair | null> {
    return this.futuresPairScannerService.stopScanning(id);
  }

  @Get('scanning-status/:id')
  @ApiOperation({
    summary: "Отримати статус сканування ф'ючерсної пари",
    description: `
    Повертає поточний статус сканування ф'ючерсної пари.
    
    Інформація включає:
    - isActive: чи активне сканування в пам'яті
    - status: статус в базі даних (ACTIVE/STOPPED)
    - lastScanTime: час останнього сканування
    - cycleCount: кількість виконаних циклів сканування
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Статус сканування отримано',
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean' },
        status: { type: 'string', enum: ['ACTIVE', 'STOPPED'] },
        lastScanTime: { type: 'string', format: 'date-time' },
        cycleCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Ф'ючерсна пара не знайдена",
  })
  async getScanningStatus(@Param('id') id: string): Promise<{
    isActive: boolean;
    status: FuturesPairStatus;
    lastScanTime?: Date;
    cycleCount: number;
  } | null> {
    return this.futuresPairScannerService.getScanningStatus(id);
  }
}
