import { Injectable } from '@nestjs/common';
import * as tulind from 'tulind';
import { InsufficientDataException } from './exceptions/insufficient-data.exception';

@Injectable()
export class IndicatorsService {
  constructor() {}

  async calculateRSI(prices: number[], period: number = 14): Promise<number[]> {
    const MIN_REQUIRED_LENGTH = 100;

    if (prices.length < MIN_REQUIRED_LENGTH) {
      throw new InsufficientDataException(
        'RSI',
        'calculateRSI',
        MIN_REQUIRED_LENGTH,
        prices.length,
        `Для точного розрахунку RSI рекомендується використовувати більше ${MIN_REQUIRED_LENGTH} елементів.`,
      );
    }

    return new Promise((resolve, reject) => {
      tulind.indicators.rsi.indicator([prices], [period], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Для короткострокового аналізу: 100-150 елементів
  // Для середньострокового аналізу: 150-200 елементів
  // Для довгострокового аналізу: 200+ елементів
  async calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
  ): Promise<{ macd: number[]; signal: number[]; histogram: number[] }> {
    const MIN_REQUIRED_LENGTH = 100;

    if (prices.length < MIN_REQUIRED_LENGTH) {
      throw new InsufficientDataException(
        'MACD',
        'calculateMACD',
        MIN_REQUIRED_LENGTH,
        prices.length,
        `Для точного розрахунку MACD рекомендується використовувати більше ${MIN_REQUIRED_LENGTH} елементів.`,
      );
    }

    return new Promise((resolve, reject) => {
      tulind.indicators.macd.indicator(
        [prices],
        [fastPeriod, slowPeriod, signalPeriod],
        (err, results) => {
          if (err) reject(err);
          resolve({
            macd: results[0],
            signal: results[1],
            histogram: results[2],
          });
        },
      );
    });
  }

  async calculateEMA(prices: number[], period: number = 14): Promise<number[]> {
    const MIN_REQUIRED_LENGTH = 100;

    if (prices.length < MIN_REQUIRED_LENGTH) {
      throw new InsufficientDataException(
        'EMA',
        'calculateEMA',
        MIN_REQUIRED_LENGTH,
        prices.length,
        `Для точного розрахунку EMA рекомендується використовувати більше ${MIN_REQUIRED_LENGTH} елементів.`,
      );
    }

    return new Promise((resolve, reject) => {
      tulind.indicators.ema.indicator([prices], [period], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  async calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stddev: number = 2,
  ): Promise<{ upper: number[]; middle: number[]; lower: number[] }> {
    const MIN_REQUIRED_LENGTH = 100;

    if (prices.length < MIN_REQUIRED_LENGTH) {
      throw new InsufficientDataException(
        'Bollinger Bands',
        'calculateBollingerBands',
        MIN_REQUIRED_LENGTH,
        prices.length,
        'Для точного розрахунку Bollinger Bands рекомендується використовувати більше 100 елементів.',
      );
    }

    return new Promise((resolve, reject) => {
      tulind.indicators.bbands.indicator(
        [prices],
        [period, stddev],
        (err, results) => {
          if (err) reject(err);
          resolve({
            upper: results[0],
            middle: results[1],
            lower: results[2],
          });
        },
      );
    });
  }

  async calculateStochastic(
    high: number[],
    low: number[],
    close: number[],
    kPeriod: number = 14,
    dPeriod: number = 3,
  ): Promise<{ k: number[]; d: number[] }> {
    return new Promise((resolve, reject) => {
      tulind.indicators.stoch.indicator(
        [high, low, close],
        [kPeriod, kPeriod, dPeriod],
        (err, results) => {
          if (err) reject(err);
          resolve({
            k: results[0],
            d: results[1],
          });
        },
      );
    });
  }

  async calculateSMA(prices: number[], period: number = 14): Promise<number[]> {
    return new Promise((resolve, reject) => {
      tulind.indicators.sma.indicator([prices], [period], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  async calculateADX(
    high: number[],
    low: number[],
    close: number[],
    period: number = 14,
  ): Promise<number[]> {
    return new Promise((resolve, reject) => {
      tulind.indicators.adx.indicator(
        [high, low, close],
        [period],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        },
      );
    });
  }

  async calculateATR(
    high: number[],
    low: number[],
    close: number[],
    period: number = 14,
  ): Promise<number[]> {
    return new Promise((resolve, reject) => {
      tulind.indicators.atr.indicator(
        [high, low, close],
        [period],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        },
      );
    });
  }

  async calculateVWAP(
    high: number[],
    low: number[],
    close: number[],
    volume: number[],
  ): Promise<number[]> {
    try {
      if (!high.length || !low.length || !close.length || !volume.length) {
        return [];
      }

      if (
        high.length !== low.length ||
        high.length !== close.length ||
        high.length !== volume.length
      ) {
        throw new Error('Input arrays must have the same length');
      }

      const vwap: number[] = [];
      let cumulativeTPV = 0; // Cumulative (Typical Price * Volume)
      let cumulativeVolume = 0; // Cumulative Volume

      for (let i = 0; i < high.length; i++) {
        // Типова ціна = (High + Low + Close) / 3
        const typicalPrice = (high[i] + low[i] + close[i]) / 3;

        // Множимо типову ціну на об'єм
        const priceVolume = typicalPrice * volume[i];

        // Додаємо до кумулятивних значень
        cumulativeTPV += priceVolume;
        cumulativeVolume += volume[i];

        // VWAP = Сума(Ціна * Об'єм) / Сума(Об'єм)
        const currentVWAP = cumulativeTPV / cumulativeVolume;

        vwap.push(currentVWAP);
      }

      return vwap;
    } catch (error) {
      console.error('Error calculating VWAP:', error);
      return [];
    }
  }
}
