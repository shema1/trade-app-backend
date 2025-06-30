import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuturesPair } from 'src/futures-pair-scanner/schemas/futures-pair.schema';
import {
  AnalysisResultRecommendation,
  StrategyAnalysisResult,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';
import {
  TradeLevel,
  TradeTarget,
  TradeTargetRequest,
  TradeAnalysisResult,
  TradeAnalysisWithTarget,
  TradeAnalysisBatch,
  TradeAnalysisRequest,
  TradeResult,
  StrategyAnalysisResponse,
  GroupedResultsByType,
  StrategyResults,
  TradeStatsAccumulator,
} from './interfaces/strategy-results-analyzer.interface';
import { BybitService } from 'src/bybit/bybit.service';
import { KlineCategory } from 'src/bybit/dto/get-kline.dto';
import { KlineDataItem } from 'src/bybit/interfaces/responses.interface';
import { differenceInMinutes } from 'date-fns';
import { filter } from 'lodash';

@Injectable()
export class StrategyResultsAnalyzerService {
  private readonly DEFAULT_STEP = 0.5;
  private readonly DEFAULT_MAX_VALUE = 10;
  private readonly MIN_BALANCE_VALUE = 10;
  constructor(
    @InjectModel(FuturesPair.name)
    private readonly futuresPairModel: Model<FuturesPair>,
    private readonly bybitService: BybitService,
  ) {}

  async getStrategyByName(
    id: string,
    name: string,
  ): Promise<StrategyAnalysisResult[]> {
    const strategy = await this.futuresPairModel.findById(id);
    if (!strategy?.results) {
      throw new NotFoundException('Strategy not found');
    }
    return filter(strategy.results, (result) => result.name === name);
  }

  async analyzeStrategyResults(
    id: string,
    batchSize: number = 50,
  ): Promise<any> {
    const futuresPair = await this.findFuturesPair(id);

    if (futuresPair.results.length === 0) {
      return {};
    }

    const batches = this.splitIntoBatches(futuresPair.results, batchSize);
    const results: StrategyAnalysisResponse[] = [];

    for (const batch of batches) {
      try {
        const batchResults = await Promise.all(
          batch.map((strategy) =>
            this.analyzeStrategy(strategy).catch((error) => {
              console.error(
                `Помилка при аналізі стратегії ${strategy.name}:`,
                error,
              );
              return null;
            }),
          ),
        );

        results.push(
          ...batchResults.filter(
            (result): result is StrategyAnalysisResponse => result !== null,
          ),
        );
      } catch (error) {
        console.error('Помилка при обробці батчу:', error);
        continue;
      }
    }

    const groupedResults = this.groupResultsByType(results);
    // return groupedResults;
    // return null;
    // return groupedResults;
    const test = this.getResults(groupedResults);
    const bestStrategy = this.pickBestStrategy(test, 3);
    return bestStrategy;
    // return this.findMostEffectiveStrategies(test);
  }

  private splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async findFuturesPair(id: string): Promise<FuturesPair> {
    const futuresPair = await this.futuresPairModel.findById(id);
    if (!futuresPair) {
      throw new NotFoundException('Futures pair not found');
    }
    return futuresPair;
  }

  generateTradeLevels(
    step: number = this.DEFAULT_STEP,
    maxValue: number = this.DEFAULT_MAX_VALUE,
  ): TradeLevel[] {
    const levels: TradeLevel[] = [];

    for (let profit = step; profit <= maxValue; profit += step) {
      for (let loss = step; loss <= maxValue; loss += step) {
        levels.push({
          label: `${profit}/-${loss}`,
          takeProfit: profit,
          stopLoss: loss,
        });
      }
    }

    return levels;
  }

  private async analyzeStrategy(
    strategyResult: StrategyAnalysisResult,
  ): Promise<StrategyAnalysisResponse> {
    const klineData = await this.fetchKlineData(strategyResult);
    const tradeLevels = this.generateTradeLevels();

    const tradeTargets = this.calculateTradeTargets({
      tradeLevels,
      strategyResult,
    });

    const tradeAnalysis = this.analyzeTradeTargets({
      tradeTargets,
      klineData,
      symbol: strategyResult.symbol,
    });

    return {
      strategy: strategyResult,
      tradeAnalysis,
    };
  }

  private async fetchKlineData(
    strategyResult: StrategyAnalysisResult,
  ): Promise<KlineDataItem[]> {
    return this.bybitService.getKlineData({
      symbol: strategyResult.symbol,
      interval: '1',
      category: KlineCategory.LINEAR,
      limit: 1000,
      start: strategyResult.timestamp,
    });
  }

  private calculateTradeTargets(data: TradeAnalysisBatch): TradeTarget[] {
    return data.tradeLevels.map((level) =>
      this.calculateTradeTarget({
        ...level,
        side: data.strategyResult.recommendation,
        entryPrice: data.strategyResult.currentPrice,
        entryTimestamp: data.strategyResult.timestamp,
      }),
    );
  }

  private calculateTradeTarget(data: TradeTargetRequest): TradeTarget {
    const { side, entryPrice, takeProfit, stopLoss } = data;

    if (!entryPrice || !takeProfit || !stopLoss) {
      throw new Error('Invalid trade target data: missing required fields');
    }

    const isBuy = side === AnalysisResultRecommendation.BUY;
    const profitPrice =
      entryPrice * (1 + (isBuy ? takeProfit : -takeProfit) / 100);
    const lossPrice = entryPrice * (1 + (isBuy ? -stopLoss : stopLoss) / 100);

    return {
      entryTimestamp: data.entryTimestamp,
      profitPrice,
      lossPrice,
      label: data.label,
      side,
      takeProfitPercent: takeProfit,
      stopLossPercent: stopLoss,
    };
  }

  private analyzeTradeTargets({
    tradeTargets,
    klineData,
    symbol,
  }: {
    tradeTargets: TradeTarget[];
    klineData: KlineDataItem[];
    symbol: string;
  }): TradeAnalysisWithTarget[] {
    return tradeTargets.map((target) => {
      const analysis = this.analyzeTrade({
        side: target.side,
        klineData,
        targetPrices: {
          profitPrice: target.profitPrice,
          lossPrice: target.lossPrice,
        },
      });

      return {
        symbol,
        ...analysis,
        ...target,
      };
    });
  }

  private analyzeTrade(data: TradeAnalysisRequest): TradeAnalysisResult {
    const { side, klineData, targetPrices } = data;

    if (!klineData || klineData.length === 0) {
      return {
        result: TradeResult.ACTIVE,
        targetReachedAt: 0,
        minutesToTarget: 0,
      };
    }

    for (let i = 1; i < klineData.length; i++) {
      const candle = klineData[i];
      const minutesToTarget = this.calculateMinutesToTarget(
        klineData[0].timestamp,
        candle.timestamp,
      );

      if (this.isTargetReached(side, candle, targetPrices)) {
        return {
          result: this.determineTradeResult(side, candle, targetPrices),
          targetReachedAt: candle.timestamp,
          minutesToTarget,
        };
      }
    }

    return {
      result: TradeResult.ACTIVE,
      targetReachedAt: 0,
      minutesToTarget: 0,
    };
  }

  private calculateMinutesToTarget(
    startTimestamp: number,
    endTimestamp: number,
  ): number {
    return differenceInMinutes(
      new Date(endTimestamp),
      new Date(startTimestamp),
    );
  }

  private isTargetReached(
    side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>,
    candle: KlineDataItem,
    targetPrices: { profitPrice: number; lossPrice: number },
  ): boolean {
    if (side === AnalysisResultRecommendation.BUY) {
      return (
        candle.high >= targetPrices.profitPrice ||
        candle.low <= targetPrices.lossPrice
      );
    }
    return (
      candle.low <= targetPrices.profitPrice ||
      candle.high >= targetPrices.lossPrice
    );
  }

  private determineTradeResult(
    side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>,
    candle: KlineDataItem,
    targetPrices: { profitPrice: number; lossPrice: number },
  ): TradeResult {
    if (side === AnalysisResultRecommendation.BUY) {
      return candle.high >= targetPrices.profitPrice
        ? TradeResult.PROFIT
        : candle.low <= targetPrices.lossPrice
          ? TradeResult.LOSS
          : TradeResult.ACTIVE;
    } else {
      return candle.low <= targetPrices.profitPrice
        ? TradeResult.PROFIT
        : candle.high >= targetPrices.lossPrice
          ? TradeResult.LOSS
          : TradeResult.ACTIVE;
    }
  }

  private groupResultsByType(
    results: StrategyAnalysisResponse[],
  ): GroupedResultsByType {
    return results.reduce((acc, result) => {
      const type = result.strategy.strategyType;
      const interval = result.strategy.interval;
      const name = result.strategy.name;

      if (!acc[type]) {
        acc[type] = {};
      }
      if (!acc[type][interval]) {
        acc[type][interval] = {};
      }
      if (!acc[type][interval][name]) {
        acc[type][interval][name] = [];
      }

      acc[type][interval][name].push(result);

      return acc;
    }, {} as GroupedResultsByType);
  }

  private getResults(data: GroupedResultsByType): StrategyResults {
    const results: StrategyResults = {};

    // Проходимо по всіх типах стратегій
    Object.entries(data).forEach(([strategyType, intervals]) => {
      // Проходимо по всіх інтервалах
      Object.entries(intervals).forEach(([intervalKey, strategies]) => {
        // Ініціалізуємо структуру для інтервалу, якщо її ще немає
        if (!results[intervalKey]) {
          results[intervalKey] = {};
        }
        if (!results[intervalKey][strategyType]) {
          results[intervalKey][strategyType] = {};
        }

        // Проходимо по всіх стратегіях
        Object.entries(strategies).forEach(
          ([strategyName, strategyResults]) => {
            // Ініціалізуємо структуру для стратегії, якщо її ще немає
            if (!results[intervalKey][strategyType][strategyName]) {
              results[intervalKey][strategyType][strategyName] = {};
            }

            // Збираємо статистику для всіх міток
            const statsAccumulator: TradeStatsAccumulator = {};

            // Проходимо по всіх результатах стратегії
            strategyResults.forEach((result) => {
              // Проходимо по всіх аналізах торгівлі
              result.tradeAnalysis.forEach((trade) => {
                const label = trade.label;

                // Ініціалізуємо статистику для цього рівня, якщо її ще немає
                if (!statsAccumulator[label]) {
                  statsAccumulator[label] = {
                    profit: 0,
                    loss: 0,
                    active: 0,
                    successRate: 0,
                    balance: 0,
                  };
                }

                // Оновлюємо статистику
                const stats = statsAccumulator[label];
                switch (trade.result) {
                  case TradeResult.PROFIT:
                    stats.profit++;
                    stats.balance += trade.takeProfitPercent;
                    break;
                  case TradeResult.LOSS:
                    stats.loss++;
                    stats.balance -= trade.stopLossPercent;
                    break;
                  case TradeResult.ACTIVE:
                    stats.active++;
                    break;
                }

                // Рахуємо відсоток успішності
                const total = stats.profit + stats.loss;
                stats.successRate =
                  total > 0 ? (stats.profit / total) * 100 : 0;
              });
            });

            // Фільтруємо статистику за minSuccessRate
            // const filteredStats = Object.entries(statsAccumulator).reduce(
            //   (acc, [label, stats]) => {
            //     if (stats.successRate >= minSuccessRate) {
            //       acc[label] = stats;
            //     }
            //     return acc;
            //   },
            //   {} as TradeStatsAccumulator,
            // );

            const filteredStats = Object.entries(statsAccumulator).reduce(
              (acc, [label, stats]) => {
                if (stats.balance >= this.MIN_BALANCE_VALUE) {
                  acc[label] = stats;
                }
                return acc;
              },
              {} as TradeStatsAccumulator,
            );

            // Додаємо відфільтровану статистику до результатів
            if (Object.keys(filteredStats).length > 0) {
              results[intervalKey][strategyType][strategyName] = filteredStats;
            } else {
              delete results[intervalKey][strategyType][strategyName];
            }
          },
        );

        // Видаляємо порожні типи стратегій
        if (Object.keys(results[intervalKey][strategyType]).length === 0) {
          delete results[intervalKey][strategyType];
        }
      });

      // Видаляємо порожні інтервали
      Object.entries(results).forEach(([key, value]) => {
        if (Object.keys(value).length === 0) {
          delete results[key];
        }
      });
    });

    return results;
  }

  findMostEffectiveStrategies(results: StrategyResults): {
    [interval: string]: {
      [strategyType: string]: {
        [strategyName: string]: {
          label: string;
          stats: {
            profit: number;
            loss: number;
            active: number;
            successRate: number;
          };
        };
      };
    };
  } {
    const mostEffective: {
      [interval: string]: {
        [strategyType: string]: {
          [strategyName: string]: {
            label: string;
            stats: {
              profit: number;
              loss: number;
              active: number;
              successRate: number;
            };
          };
        };
      };
    } = {};

    // Проходимо по всіх інтервалах
    Object.entries(results).forEach(([interval, types]) => {
      mostEffective[interval] = {};

      // Проходимо по всіх типах стратегій
      Object.entries(types).forEach(([strategyType, strategies]) => {
        mostEffective[interval][strategyType] = {};

        // Проходимо по всіх стратегіях
        Object.entries(strategies).forEach(([strategyName, labels]) => {
          // Знаходимо найкращий результат для цієї стратегії
          const bestResult = Object.entries(labels).reduce(
            (best, [label, stats]) => {
              // Порівнюємо за відсотком успішності
              if (!best || stats.successRate > best.stats.successRate) {
                return { label, stats };
              }
              // Якщо відсотки однакові, порівнюємо за кількістю прибуткових угод
              if (stats.successRate === best.stats.successRate) {
                if (stats.profit > best.stats.profit) {
                  return { label, stats };
                }
                // Якщо кількість прибуткових угод однакова, порівнюємо за загальною кількістю угод
                if (
                  stats.profit === best.stats.profit &&
                  stats.profit + stats.loss >
                    best.stats.profit + best.stats.loss
                ) {
                  return { label, stats };
                }
              }
              return best;
            },
            null as { label: string; stats: (typeof labels)[string] } | null,
          );

          // Додаємо найкращий результат до результатів
          if (bestResult) {
            mostEffective[interval][strategyType][strategyName] = bestResult;
          }
        });

        // Видаляємо порожні типи стратегій
        if (Object.keys(mostEffective[interval][strategyType]).length === 0) {
          delete mostEffective[interval][strategyType];
        }
      });

      // Видаляємо порожні інтервали
      if (Object.keys(mostEffective[interval]).length === 0) {
        delete mostEffective[interval];
      }
    });

    return mostEffective;
  }

  private pickBestStrategy(
    results: StrategyResults,
    numOfBest: number,
  ): StrategyResults {
    const bestStrategy: StrategyResults = {};

    // Проходимо по всіх інтервалах
    Object.entries(results).forEach(([interval, types]) => {
      bestStrategy[interval] = {};

      // Проходимо по всіх типах стратегій
      Object.entries(types).forEach(([strategyType, strategies]) => {
        bestStrategy[interval][strategyType] = {};

        // Проходимо по всіх стратегіях
        Object.entries(strategies).forEach(([strategyName, labels]) => {
          // Сортуємо всі рівні за балансом (спочатку найвищий)
          const sortedLabels = Object.entries(labels).sort(
            ([, statsA], [, statsB]) => {
              return statsB.balance - statsA.balance;
            },
          );

          // Беремо тільки найкращі numOfBest результатів
          const bestLabels = sortedLabels.slice(0, numOfBest);

          // Створюємо об'єкт з найкращими результатами
          const bestResults = bestLabels.reduce((acc, [label, stats]) => {
            acc[label] = stats;
            return acc;
          }, {} as TradeStatsAccumulator);

          // Додаємо до результатів, якщо є хоча б один результат
          if (Object.keys(bestResults).length > 0) {
            bestStrategy[interval][strategyType][strategyName] = bestResults;
          }
        });

        // Видаляємо порожні типи стратегій
        if (Object.keys(bestStrategy[interval][strategyType]).length === 0) {
          delete bestStrategy[interval][strategyType];
        }
      });

      // Видаляємо порожні інтервали
      if (Object.keys(bestStrategy[interval]).length === 0) {
        delete bestStrategy[interval];
      }
    });

    return bestStrategy;
  }
}
