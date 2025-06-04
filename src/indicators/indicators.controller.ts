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
            76.6990291262136, 78.90466531440163, 80.40295695028264,
            80.89018233479872, 81.8614875208154, 83.23776801157999,
            76.94997211877278, 74.9184105301518, 76.64489020787923,
            78.14066412494574, 79.32876652228818, 80.47181207469566,
            81.56935702418467, 82.62123180698055, 83.62752072506338,
            84.58854014177108, 85.50481577167918, 86.37705958329623,
            87.2061467731324, 87.99309320502104, 88.73903364235875,
            89.44520103582406, 90.11290706723022, 90.74352409301606,
            91.33846857952818, 91.89918607730199, 92.42713774323322,
            92.92378838777422, 93.39059599878082, 93.82900267390937,
            94.24042687894251, 94.62625693947356, 94.9878456673549,
            95.32650602057558, 95.64350769517763, 95.94007454989436,
            96.21738276790369, 96.47655966500079, 96.71868305923847,
            96.94478112334846, 97.15583264778884, 97.35276764885732,
            97.53646826280827, 97.7077698731926, 97.86746242461706,
            98.01629188173226, 98.15496179747116, 98.28413495935106,
            98.40443508701931, 98.51644855816932, 98.62072614349688,
            98.71778473452264, 98.8081090509025, 98.89215331630749,
            98.97034289410485, 99.04307587594298, 99.11072461795717,
            99.17363722070031, 99.23213895008497, 99.28653359762436,
            99.33710477910054, 99.38411717148942, 99.42781768854783,
            99.46843659594124, 99.5061885671656, 99.54127368181808,
            99.57387836799954, 99.60417629080476, 99.63232918897873,
            99.65848766189892, 99.68279190908959, 99.7053724244926,
            99.72635064771322, 99.74583957443458, 99.76394432815363,
            99.78076269533953, 99.79638562605302, 99.81089770199624,
            99.82437757388844, 99.83689836998545, 99.84852807748041,
            99.85932989844383, 99.86936258187897, 99.87868073338943,
            99.88733510387718, 99.89537285861195, 99.90283782793904,
            99.90977074081974, 99.9162094423299, 99.92218909617479,
            99.9277423732153, 99.9328996269393, 99.93768905675462,
            99.9421368599245, 99.94626737291526, 99.95010320287577,
            99.9536653499228, 99.95697332086125, 99.96004523492861,
            99.96289792211252, 99.96554701455476, 99.96800703152084,
            99.97029145838134, 99.97241282002182, 99.97438274906982,
            99.97621204930047, 99.97791075455811, 99.97948818350821,
            99.98095299051167, 99.98231321289424, 99.98357631486451,
            99.98474922831618,
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
