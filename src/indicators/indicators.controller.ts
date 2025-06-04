import { Controller, Post, Body } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculateRSIDto } from './dto/calculate-rsi.dto';
import { CalculateMACDDto } from './dto/calculate-macd.dto';
import { CalculateBollingerBandsDto } from './dto/calculate-bollinger-bands.dto';
import { CalculateStochasticDto } from './dto/calculate-stochastic.dto';
import { CalculateVWAPDto } from './dto/calculate-vwap.dto';

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
          description: 'Масив значень MACD',
        },
        signal: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень сигнальної лінії',
        },
        histogram: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень гістограми',
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

  @Post('bollinger-bands')
  @ApiOperation({ summary: 'Розрахувати Bollinger Bands' })
  @ApiResponse({
    status: 200,
    description: 'Успішно розраховано Bollinger Bands',
    schema: {
      type: 'object',
      properties: {
        upper: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень верхньої смуги',
        },
        middle: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень середньої смуги',
        },
        lower: {
          type: 'array',
          items: { type: 'number' },
          description: 'Масив значень нижньої смуги',
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
