import { Controller, Post, Body } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculateRSIDto } from './dto/calculate-rsi.dto';
import { CalculateMACDDto } from './dto/calculate-macd.dto';
import { CalculateBollingerBandsDto } from './dto/calculate-bollinger-bands.dto';
import { CalculateStochasticDto } from './dto/calculate-stochastic.dto';
import { CalculateVWAPDto } from './dto/calculate-vwap.dto';
import { CalculateEMADto } from './dto/calculate-ema.dto';

@ApiTags('indicators')
@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Post('rsi')
  @ApiOperation({ summary: 'Розрахувати RSI (Relative Strength Index)' })
  @ApiResponse({
    status: 200,
    description: 'Успішно розраховано RSI',
    schema: {
      type: 'object',
      properties: {
        rsi: {
          type: 'array',
          items: {
            type: 'number',
          },
          description: 'Масив значень RSI',
          example: [
            48000.0, 48250.0, 48120.0, 48380.0, 48450.0, 48600.0, 48500.0,
            48750.0, 48800.0, 48950.0, 48800.0, 49000.0, 49150.0, 49200.0,
            49100.0, 49300.0, 49450.0, 49500.0, 49600.0, 49750.0, 49600.0,
            49550.0, 49680.0, 49800.0, 49900.0,
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Невірні вхідні дані',
  })
  async calculateRSI(@Body() dto: CalculateRSIDto) {
    const rsi = await this.indicatorsService.calculateRSI(
      dto.prices,
      dto.period,
    );
    return { rsi };
  }

  @Post('macd')
  @ApiOperation({
    summary: 'Розрахувати MACD (Moving Average Convergence Divergence)',
    description:
      'Розраховує MACD, сигнальну лінію та гістограму. Для точного розрахунку рекомендується використовувати 100-200 елементів.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно розраховано MACD',
    schema: {
      type: 'object',
      properties: {
        macd: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Масив значень MACD (різниця між швидкою та повільною EMA)',
          example: [0.5, 0.7, 0.3, 0.8, 1.2, 1.5, 1.3, 1.1, 0.9, 0.7],
        },
        signal: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень сигнальної лінії (EMA від MACD)',
          example: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
        },
        histogram: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Масив значень гістограми (різниця між MACD та сигнальною лінією)',
          example: [0.2, 0.3, -0.2, 0.2, 0.5, 0.7, 0.4, 0.1, -0.2, -0.5],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Помилка вхідних даних',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Insufficient Data' },
        message: {
          type: 'string',
          example:
            'Помилка в функції calculateMACD: Для розрахунку MACD потрібно мінімум 100 елементів. Надано 50 елементів. Для точного розрахунку MACD рекомендується використовувати 100-200 елементів.',
        },
        details: {
          type: 'object',
          properties: {
            indicator: { type: 'string', example: 'MACD' },
            function: { type: 'string', example: 'calculateMACD' },
            requiredLength: { type: 'number', example: 100 },
            actualLength: { type: 'number', example: 50 },
            additionalInfo: {
              type: 'string',
              example:
                'Для точного розрахунку MACD рекомендується використовувати 100-200 елементів.',
            },
          },
        },
      },
    },
  })
  async calculateMACD(@Body() dto: CalculateMACDDto) {
    const macd = await this.indicatorsService.calculateMACD(
      dto.prices,
      dto.fastPeriod,
      dto.slowPeriod,
      dto.signalPeriod,
    );
    return macd;
  }

  @Post('ema')
  @ApiOperation({
    summary: 'Розрахувати EMA (Exponential Moving Average)',
    description: `Розраховує експоненціальну ковзну середню (EMA).
    
    Особливості розрахунку:
    - EMA надає більшу вагу останнім цінам, ніж SMA
    - Чим менший період, тим швидше EMA реагує на зміни ціни
    - Чим більший період, тим більш плавна лінія, але з більшою затримкою
    
    Рекомендації щодо використання:
    - Короткостроковий аналіз: період 5-10
    - Середньостроковий аналіз: період 10-20
    - Довгостроковий аналіз: період 20-50
    
    Для точного розрахунку рекомендується використовувати не менше 100 елементів.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно розраховано EMA',
    schema: {
      type: 'object',
      properties: {
        ema: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Масив значень EMA. Кожне значення представляє експоненціальну ковзну середню для відповідного періоду.',
          example: [
            48000.0, 48100.0, 48150.0, 48200.0, 48250.0, 48300.0, 48350.0,
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Помилка вхідних даних',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Insufficient Data' },
        message: {
          type: 'string',
          example:
            'Помилка в функції calculateEMA: Для розрахунку EMA потрібно мінімум 100 елементів. Надано 50 елементів. Для точного розрахунку рекомендується використовувати більше 100 елементів.',
        },
        details: {
          type: 'object',
          properties: {
            indicator: { type: 'string', example: 'EMA' },
            function: { type: 'string', example: 'calculateEMA' },
            requiredLength: { type: 'number', example: 100 },
            actualLength: { type: 'number', example: 50 },
            additionalInfo: {
              type: 'string',
              example:
                'Для точного розрахунку рекомендується використовувати більше 100 елементів.',
            },
          },
        },
      },
    },
  })
  async calculateEMA(@Body() dto: CalculateEMADto) {
    const ema = await this.indicatorsService.calculateEMA(
      dto.prices,
      dto.period,
    );
    return { ema };
  }

  @Post('bollinger-bands')
  @ApiOperation({
    summary: 'Розрахувати Bollinger Bands',
    description: `Розраховує смуги Боллінджера - технічний індикатор, що складається з трьох ліній:
    
    Особливості розрахунку:
    - Середня лінія (middle): 20-періодна ковзна середня (SMA)
    - Верхня смуга (upper): середня лінія + (стандартне відхилення * множник)
    - Нижня смуга (lower): середня лінія - (стандартне відхилення * множник)
    
    Вплив параметрів на результат:
    - period: 
      * Визначає період для розрахунку ковзної середньої
      * Більший період дає більш плавні смуги, але з більшою затримкою
      * Стандартне значення 20 добре працює для більшості випадків
      * Рекомендований діапазон: 10-50
    
    - stddev (множник стандартного відхилення):
      * Визначає ширину смуг
      * Більше значення = ширші смуги
      * Менше значення = вужчі смуги
      * Стандартне значення 2 охоплює ~95% цінових рухів
      * Рекомендований діапазон: 1.5-3
    
    Інтерпретація результатів:
    - Ціна торкається верхньої смуги: можливий перекуплений ринок
    - Ціна торкається нижньої смуги: можливий перепроданий ринок
    - Стиснення смуг: можливий початок сильного руху ціни
    - Розширення смуг: можливе завершення тренду
    
    Для точного розрахунку рекомендується використовувати не менше 100 елементів.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно розраховано Bollinger Bands',
    schema: {
      type: 'object',
      properties: {
        upper: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Масив значень верхньої смуги. Визначає верхню межу волатильності ціни.',
          example: [48500.0, 48600.0, 48700.0, 48800.0, 48900.0],
        },
        middle: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Масив значень середньої смуги (SMA). Визначає основну лінію тренду.',
          example: [48000.0, 48100.0, 48200.0, 48300.0, 48400.0],
        },
        lower: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Масив значень нижньої смуги. Визначає нижню межу волатильності ціни.',
          example: [47500.0, 47600.0, 47700.0, 47800.0, 47900.0],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Помилка вхідних даних',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Insufficient Data' },
        message: {
          type: 'string',
          example:
            'Помилка в функції calculateBollingerBands: Для розрахунку Bollinger Bands потрібно мінімум 100 елементів. Надано 50 елементів. Для точного розрахунку рекомендується використовувати більше 100 елементів.',
        },
        details: {
          type: 'object',
          properties: {
            indicator: { type: 'string', example: 'Bollinger Bands' },
            function: { type: 'string', example: 'calculateBollingerBands' },
            requiredLength: { type: 'number', example: 100 },
            actualLength: { type: 'number', example: 50 },
            additionalInfo: {
              type: 'string',
              example:
                'Для точного розрахунку рекомендується використовувати більше 100 елементів.',
            },
          },
        },
      },
    },
  })
  async calculateBollingerBands(@Body() dto: CalculateBollingerBandsDto) {
    const bbands = await this.indicatorsService.calculateBollingerBands(
      dto.prices,
      dto.period,
      dto.stddev,
    );
    return bbands;
  }

  @Post('stochastic')
  @ApiOperation({ summary: 'Розрахувати Stochastic Oscillator' })
  @ApiResponse({
    status: 200,
    description: 'Успішно розраховано Stochastic',
    schema: {
      type: 'object',
      properties: {
        k: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень %K',
        },
        d: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень %D',
        },
      },
    },
  })
  async calculateStochastic(@Body() dto: CalculateStochasticDto) {
    const stoch = await this.indicatorsService.calculateStochastic(
      dto.high,
      dto.low,
      dto.close,
      dto.kPeriod,
      dto.dPeriod,
    );
    return stoch;
  }

  @Post('vwap')
  @ApiOperation({ summary: 'Розрахувати VWAP (Volume Weighted Average Price)' })
  @ApiResponse({
    status: 200,
    description: 'Успішно розраховано VWAP',
    schema: {
      type: 'object',
      properties: {
        vwap: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень VWAP',
        },
      },
    },
  })
  async calculateVWAP(@Body() dto: CalculateVWAPDto) {
    const vwap = await this.indicatorsService.calculateVWAP(
      dto.high,
      dto.low,
      dto.close,
      dto.volume,
    );
    return { vwap };
  }
}
