import { Injectable } from '@nestjs/common';
import { BybitService } from 'src/bybit/bybit.service';
import { IndicatorsService } from 'src/indicators/indicators.service';
import { VolumeStrategyParamsDto } from './dto/volume-strategy-params';
import {
  AnalysisResult,
  AnalysisResultRecommendation,
  StrategyType,
} from 'src/futures-pair-scanner/interfaces/analysis-result';
import { KlineCategory } from 'src/bybit/dto/get-kline.dto';
import { omit } from 'lodash';

const VOLUME_DEFAULT_STRATEGY_PARAMS = {
  minVolumeRatio: 2.5,
  minConfidence: 0.75,
  limit: 50,
};

@Injectable()
export class VolumeStrategyService {
  constructor(
    private readonly bybitService: BybitService,
    private readonly indicatorsService: IndicatorsService,
  ) {}

  async analyzeVolume(
    params: VolumeStrategyParamsDto,
  ): Promise<AnalysisResult> {
    try {
      const {
        symbol,
        interval,
        kline,
        minVolumeRatio = VOLUME_DEFAULT_STRATEGY_PARAMS.minVolumeRatio,
        minConfidence = VOLUME_DEFAULT_STRATEGY_PARAMS.minConfidence,
        limit = VOLUME_DEFAULT_STRATEGY_PARAMS.limit,
        category = KlineCategory.LINEAR,
      } = params;

      // ? takeRight(kline, limit)
      const klineData = kline?.length
        ? kline
        : await this.bybitService.getKlineData({
            symbol,
            interval,
            limit,
            category,
          });

      if (!klineData?.length) return this.getDefaultResult(symbol, params);

      const volumes = klineData.map((k) => k.volume);
      const closePrices = klineData.map((k) => k.close);
      const highPrices = klineData.map((k) => k.high);
      const lowPrices = klineData.map((k) => k.low);

      // Розрахунок базових метрик
      const currentPrice = closePrices[closePrices.length - 1];
      const currentVolume = volumes[volumes.length - 1];
      const avgVolume = this.calculateSMA(volumes, 20);
      const volumeRatio = currentVolume / avgVolume;

      // Розрахунок технічних індикаторів
      const vwap = await this.indicatorsService.calculateVWAP(
        highPrices,
        lowPrices,
        closePrices,
        volumes,
      );

      const obv = this.calculateOBV(closePrices, volumes);
      const rsi = await this.indicatorsService.calculateRSI(closePrices);

      // Аналіз патернів об'єму
      const volumeSpike = volumeRatio > minVolumeRatio;
      const volumeTrend = this.detectVolumeTrend(volumes.slice(-10));
      const priceAction = this.analyzePriceAction(closePrices.slice(-5));

      // Визначення рекомендації
      let recommendation: AnalysisResultRecommendation =
        AnalysisResultRecommendation.HOLD;
      let confidence = 0;

      if (volumeSpike) {
        const priceAboveVWAP = currentPrice > vwap[vwap.length - 1];
        const obvTrend = obv[obv.length - 1] > obv[obv.length - 5];
        const rsiValue = rsi[rsi.length - 1];

        if (
          priceAboveVWAP &&
          obvTrend &&
          volumeTrend === 'up' &&
          volumeRatio >= minVolumeRatio
        ) {
          recommendation = AnalysisResultRecommendation.BUY;
          confidence = this.calculateConfidence({
            volumeRatio,
            rsi: rsiValue,
            priceAction,
            obvTrend: true,
          });
        } else if (
          !priceAboveVWAP &&
          !obvTrend &&
          volumeTrend === 'down' &&
          volumeRatio >= minVolumeRatio
        ) {
          recommendation = AnalysisResultRecommendation.SELL;
          confidence = this.calculateConfidence({
            volumeRatio,
            rsi: rsiValue,
            priceAction,
            obvTrend: false,
          });
        }

        if (confidence < minConfidence) {
          recommendation = AnalysisResultRecommendation.HOLD;
          confidence = 0;
        }
      }

      return {
        symbol,
        strategyType: StrategyType.VOLUME_ANALYSIS,
        recommendation,
        confidence,
        currentPrice,
        signals: [
          {
            name: 'Volume Spike',
            value: volumeRatio,
            interpretation: `Volume ${volumeRatio.toFixed(2)}x above average`,
          },
          {
            name: 'OBV Trend',
            value: obv[obv.length - 1],
            interpretation: 'Accumulation/Distribution pattern detected',
          },
          {
            name: 'Price Action',
            value: priceAction.strength,
            interpretation: `${priceAction.type} momentum`,
          },
          {
            name: 'RSI',
            value: rsi[rsi.length - 1],
            interpretation: `RSI: ${rsi[rsi.length - 1].toFixed(2)}`,
          },
          {
            name: 'VWAP',
            value: vwap[vwap.length - 1],
            interpretation: `VWAP: ${vwap[vwap.length - 1].toFixed(2)}`,
          },
          {
            name: 'Volume',
            value: currentVolume,
            interpretation: `Volume: ${currentVolume.toFixed(2)}`,
          },
          {
            name: 'Average Volume',
            value: avgVolume,
            interpretation: `Average volume: ${avgVolume.toFixed(2)}`,
          },
        ],
        timestamp: Date.now(),
        strategyDetails: omit(params, 'kline'),
      };
    } catch (error) {
      console.error(`Error in volume analysis for ${params.symbol}:`, error);
      return this.getDefaultResult(params.symbol, params);
    }
  }

  private getDefaultResult(
    symbol: string,
    params: VolumeStrategyParamsDto,
  ): AnalysisResult {
    return {
      symbol,
      strategyType: StrategyType.VOLUME_ANALYSIS,
      recommendation: AnalysisResultRecommendation.HOLD,
      confidence: 0,
      currentPrice: 0,
      signals: [],
      timestamp: Date.now(),
      strategyDetails: omit(params, 'kline'),
    };
  }

  private calculateConfidence(params: {
    volumeRatio: number;
    rsi: number;
    priceAction: { type: string; strength: number };
    obvTrend: boolean;
  }): number {
    let confidence = 0;

    // Volume component (0-0.4)
    confidence += Math.min(params.volumeRatio / 5, 1) * 0.4;

    // RSI component (0-0.2)
    const rsiScore = params.rsi > 70 ? 0.1 : params.rsi < 30 ? 0.2 : 0.15;
    confidence += rsiScore;

    // Price action component (0-0.2)
    confidence += params.priceAction.strength * 0.2;

    // OBV trend component (0-0.2)
    confidence += params.obvTrend ? 0.2 : 0;

    return Math.min(confidence, 1);
  }

  private analyzePriceAction(prices: number[]): {
    type: string;
    strength: number;
  } {
    const changes = prices.map((price, i) =>
      i === 0 ? 0 : ((price - prices[i - 1]) / prices[i - 1]) * 100,
    );

    const momentum = changes.reduce((acc, change) => acc + change, 0);
    const volatility = Math.sqrt(
      changes.reduce((acc, change) => acc + change * change, 0) /
        changes.length,
    );

    return {
      type: momentum > 0 ? 'bullish' : 'bearish',
      strength: Math.min((Math.abs(momentum) * volatility) / 100, 1),
    };
  }

  private calculateSMA(data: number[], period: number): number {
    return data.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  private calculateOBV(prices: number[], volumes: number[]): number[] {
    const obv: number[] = [0];

    for (let i = 1; i < prices.length; i++) {
      const currentOBV = obv[i - 1];
      if (prices[i] > prices[i - 1]) {
        obv.push(currentOBV + volumes[i]);
      } else if (prices[i] < prices[i - 1]) {
        obv.push(currentOBV - volumes[i]);
      } else {
        obv.push(currentOBV);
      }
    }

    return obv;
  }

  private detectVolumeTrend(volumes: number[]): 'up' | 'down' | 'neutral' {
    const trend = volumes.reduce((acc, vol, i) => {
      if (i === 0) return 0;
      return acc + (vol > volumes[i - 1] ? 1 : -1);
    }, 0);

    if (trend > 3) return 'up';
    if (trend < -3) return 'down';
    return 'neutral';
  }
}
