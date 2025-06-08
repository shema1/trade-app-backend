import { Injectable } from '@nestjs/common';
import { BybitService } from 'src/bybit/bybit.service';
import { IndicatorsService } from 'src/indicators/indicators.service';
import {
  DEFAULT_STRATEGY_PARAMS,
  MomentumEmaStrategyParamsDto,
} from './dto/strategy-params.dto';
import { ApiProperty } from '@nestjs/swagger';
import { omit } from 'lodash';
import {
  AnalysisResultRecommendation,
  StrategyAnalysisResult,
  StrategyType,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

@Injectable()
export class MomentumEmaCrossStrategyService {
  constructor(
    private readonly bybitService: BybitService,
    private readonly indicatorsService: IndicatorsService,
  ) {}

  @ApiProperty({
    description: 'Символ торгової пари (наприклад, BTCUSDT)',
    example: 'BTCUSDT',
    required: true,
  })
  async momentumEmaCrossStrategy(
    params: MomentumEmaStrategyParamsDto,
  ): Promise<StrategyAnalysisResult> {
    try {
      const {
        symbol,
        interval,
        kline,
        limit = DEFAULT_STRATEGY_PARAMS.limit,
        minPriceChangePercent = DEFAULT_STRATEGY_PARAMS.minPriceChangePercent,
        minAdxStrength = DEFAULT_STRATEGY_PARAMS.minAdxStrength,
        minVolatilityPercent = DEFAULT_STRATEGY_PARAMS.minVolatilityPercent,
        emaShortPeriod = DEFAULT_STRATEGY_PARAMS.emaShortPeriod,
        emaLongPeriod = DEFAULT_STRATEGY_PARAMS.emaLongPeriod,
        maxAtrPercent = DEFAULT_STRATEGY_PARAMS.maxAtrPercent,
        trendOnly = DEFAULT_STRATEGY_PARAMS.trendOnly,
        dynamicAtrFilter = DEFAULT_STRATEGY_PARAMS.dynamicAtrFilter,
        category = DEFAULT_STRATEGY_PARAMS.category,
        name = DEFAULT_STRATEGY_PARAMS.name,
        minConfidence = DEFAULT_STRATEGY_PARAMS.minConfidence,
      } = params;

      const klineData = kline?.length
        ? kline
        : await this.bybitService
            .getKlineData({
              symbol,
              interval,
              limit,
              category,
            }) // TODO: change to 300
            .catch((err) => {
              console.error(`Failed to get kline data for ${symbol}:`, err);
              return [];
            });

      if (!klineData?.length) {
        return this.getDefaultResult(symbol, params);
      }

      const closePrices = klineData.map((k) => k.close);
      const highPrices = klineData.map((k) => k.high);
      const lowPrices = klineData.map((k) => k.low);

      if (closePrices.length < Math.max(emaLongPeriod, 2)) {
        return this.getDefaultResult(symbol, params);
      }

      const currentPrice = closePrices[closePrices.length - 1];
      const previousPrice = closePrices[closePrices.length - 2];

      // Розрахунок індикаторів з обробкою помилок
      const [atr, adx, emaShort, emaLong] = await Promise.all([
        this.indicatorsService
          .calculateATR(highPrices, lowPrices, closePrices)
          .catch(() => [0]),
        this.indicatorsService
          .calculateADX(highPrices, lowPrices, closePrices)
          .catch(() => [0]),
        this.indicatorsService
          .calculateEMA(closePrices, emaShortPeriod)
          .catch(() => [0]),
        this.indicatorsService
          .calculateEMA(closePrices, emaLongPeriod)
          .catch(() => [0]),
      ]);

      const currentATR = atr[atr.length - 1] || 0;
      const currentADX = adx[adx.length - 1] || 0;
      const currentEmaShort = emaShort[emaShort.length - 1] || 0;
      const prevEmaShort = emaShort[emaShort.length - 2] || 0;
      const currentEmaLong = emaLong[emaLong.length - 1] || 0;
      const prevEmaLong = emaLong[emaLong.length - 2] || 0;

      // Розрахунок метрик ринку
      const averagePrice =
        closePrices.reduce((a, b) => a + b, 0) / closePrices.length;
      const atrPercent = (currentATR / averagePrice) * 100;
      const priceChangePercent =
        ((currentPrice - previousPrice) / previousPrice) * 100;

      // Динамічний фільтр ATR
      let effectiveMinVolatility = minVolatilityPercent;
      if (dynamicAtrFilter) {
        const marketVolatility = atrPercent;
        effectiveMinVolatility = Math.min(
          minVolatilityPercent * (1 + marketVolatility / 10),
          maxAtrPercent,
        );
      }

      // Перевірка умов ринку
      const isVolatile = atrPercent >= effectiveMinVolatility;
      const isTrending = currentADX >= minAdxStrength;
      const isGoldenCross =
        currentEmaShort > currentEmaLong && prevEmaShort <= prevEmaLong;
      const isDeathCross =
        currentEmaShort < currentEmaLong && prevEmaShort >= prevEmaLong;

      // Визначення рекомендації
      let recommendation: AnalysisResultRecommendation =
        AnalysisResultRecommendation.HOLD;
      let confidence = 0;

      // Перевірка основних умов
      const baseConditions = isVolatile && (!trendOnly || isTrending);
      const priceChangeCondition =
        Math.abs(priceChangePercent) >= minPriceChangePercent;
      const volatilityCondition = atrPercent <= maxAtrPercent;

      if (baseConditions && priceChangeCondition && volatilityCondition) {
        if (isGoldenCross) {
          recommendation = AnalysisResultRecommendation.BUY;
          confidence = this.calculateConfidence(
            currentADX,
            atrPercent,
            priceChangePercent,
            true,
            minAdxStrength,
            effectiveMinVolatility,
          );
        } else if (isDeathCross) {
          recommendation = AnalysisResultRecommendation.SELL;
          confidence = this.calculateConfidence(
            currentADX,
            atrPercent,
            priceChangePercent,
            false,
            minAdxStrength,
            effectiveMinVolatility,
          );
        }
      }

      if (confidence < minConfidence) {
        recommendation = AnalysisResultRecommendation.HOLD;
        confidence = 0;
      }

      return {
        name,
        symbol,
        strategyType: StrategyType.MOMENTUM_EMA_CROSS,
        recommendation,
        confidence,
        currentPrice,
        signals: [
          {
            name: 'EMA Cross',
            value: currentEmaShort - currentEmaLong,
            interpretation: isGoldenCross
              ? `Golden Cross (EMA${emaShortPeriod} перетнула EMA${emaLongPeriod} знизу вверх)`
              : isDeathCross
                ? `Death Cross (EMA${emaShortPeriod} перетнула EMA${emaLongPeriod} зверху вниз)`
                : 'Немає перетину',
          },
          {
            name: 'Price Momentum',
            value: priceChangePercent,
            interpretation: `Зміна ціни: ${priceChangePercent.toFixed(2)}%`,
          },
          {
            name: 'Volatility (ATR)',
            value: atrPercent,
            interpretation: `ATR: ${atrPercent.toFixed(2)}% ${
              isVolatile
                ? '(достатня волатильність)'
                : '(недостатня волатильність)'
            }`,
          },
          {
            name: 'Trend Strength (ADX)',
            value: currentADX,
            interpretation: `ADX: ${currentADX.toFixed(2)} ${
              isTrending ? '(є тренд)' : '(боковий рух)'
            }`,
          },
        ],
        timestamp: Date.now(),
        strategyDetails: omit(params, 'kline'),
      };
    } catch (error) {
      console.error(
        `Error in momentum EMA cross strategy for ${params.symbol}:`,
        error,
      );
      return this.getDefaultResult(params.symbol, params);
    }
  }

  private getDefaultResult(
    symbol: string,
    params: MomentumEmaStrategyParamsDto,
  ): StrategyAnalysisResult {
    return {
      symbol,
      name: params.name,
      strategyType: StrategyType.MOMENTUM_EMA_CROSS,
      recommendation: AnalysisResultRecommendation.HOLD,
      confidence: 0,
      currentPrice: 0,
      signals: [
        {
          name: 'Error',
          value: 0,
          interpretation: 'Помилка при аналізі',
        },
      ],
      timestamp: Date.now(),
      strategyDetails: omit(params, 'kline'),
    };
  }

  private calculateConfidence(
    adx: number,
    atr: number,
    priceChange: number,
    isBuy: boolean,
    minAdx: number,
    minVolatility: number,
  ): number {
    // Нормалізація компонентів
    const normalizeValue = (
      value: number,
      min: number,
      max: number,
    ): number => {
      if (value < min) return 0;
      if (value > max) return 1;
      return (value - min) / (max - min);
    };

    // ADX компонент (0-0.4)
    const adxScore = normalizeValue(adx, minAdx, 60) * 0.4;

    // ATR компонент (0-0.3)
    // Використовуємо динамічні межі для ATR
    const maxAtrMultiplier = 3; // ATR не повинен бути більше ніж в 3 рази від мінімального
    const atrScore =
      normalizeValue(atr, minVolatility, minVolatility * maxAtrMultiplier) *
      0.3;

    // Компонент зміни ціни (0-0.3)
    const minPriceChange = 0.5;
    const maxPriceChange = 5.0;
    const priceChangeAbs = Math.abs(priceChange);
    const priceChangeScore =
      normalizeValue(priceChangeAbs, minPriceChange, maxPriceChange) * 0.3;

    // Базова впевненість
    let confidence = adxScore + atrScore + priceChangeScore;

    // Перевірка напрямку руху ціни
    if ((isBuy && priceChange < 0) || (!isBuy && priceChange > 0)) {
      confidence *= 0.5; // Знижуємо впевненість при невідповідності напрямку
    }

    // Додаткові множники
    if (adx > 40) confidence *= 1.1; // Бонус за сильний тренд
    if (atr < minVolatility * 1.5) confidence *= 0.9; // Пеналті за низьку волатильність

    // Забезпечуємо, що результат в межах [0, 1]
    return Math.min(Math.max(confidence, 0), 1);
  }

  // async momentumEmaCrossStrategyBatch(
  //   params: MomentumEmaStrategyParamsDto[],
  // ): Promise<StrategyAnalysisResult[]> {
  //   // return Pr
  // }
}
