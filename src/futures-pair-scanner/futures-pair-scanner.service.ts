import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuturesPair, FuturesPairStatus } from './schemas/futures-pair.schema';
import { StartScanningDto } from './dto/start-scanning.dto';
import { findLast, isEmpty } from 'lodash';
import { addMinutes, isAfter, differenceInMilliseconds } from 'date-fns';
import { BybitService } from 'src/bybit/bybit.service';
import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { VolumeStrategyService } from 'src/volume-strategy/volume-strategy.service';
import { MomentumEmaCrossStrategyService } from 'src/momentum-ema-cross-strategy/momentum-ema-cross-strategy.service';
import { StrategiesHandlerService } from 'src/strategies-handler/strategies-handler.service';
import {
  AnalysisResultRecommendation,
  StrategyAnalysisResult,
  StartegyScanningIntervalParams,
  StrategyType,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';
import { CreateOrderDto } from 'src/bybit/dto/create-order.dto';
import { LimitOrderParams } from 'src/bybit/interfaces/responses.interface';
import { OrderSideV5 } from 'bybit-api';

@Injectable()
export class FuturesPairScannerService {
  private readonly logger = new Logger(FuturesPairScannerService.name);
  private readonly pairScannerTaskMap: Map<string, boolean> = new Map();
  private readonly scanInProgress: Map<string, boolean> = new Map();
  private readonly SCAN_INTERVAL = 1000;
  private readonly BATCH_SIZE = 50;
  private readonly PAUSE_IN_MINUTES_BETWEEN_SIGNALS = 360;

  constructor(
    @InjectModel(FuturesPair.name)
    private readonly futuresPairModel: Model<FuturesPair>,
    private readonly bybitService: BybitService,
    private readonly momentumEmaCrossStrategyService: MomentumEmaCrossStrategyService,
    private readonly volumeStrategyService: VolumeStrategyService,
    private readonly strategiesHandlerService: StrategiesHandlerService,
  ) {}

  async getFuturePairById(id: string): Promise<FuturesPair | null> {
    // const test = [
    //   {
    //     symbol: 'BERAUSDT',
    //     name: 'Volume Swing 5m',
    //     strategyType: 'VOLUME_ANALYSIS',
    //     recommendation: 'BUY',
    //     confidence: 0.7027481415088985,
    //     currentPrice: 1.875,
    //     interval: '5',
    //     signals: [
    //       {
    //         name: 'Volume Spike',
    //         value: 5.098618839669534,
    //         interpretation: 'Volume 5.10x above average',
    //       },
    //       {
    //         name: 'OBV Trend',
    //         value: 2029595,
    //         interpretation: 'Accumulation/Distribution pattern detected',
    //       },
    //       {
    //         name: 'Price Action',
    //         value: 0.013740707544492126,
    //         interpretation: 'bullish momentum',
    //       },
    //       {
    //         name: 'RSI',
    //         value: 78.7717043601553,
    //         interpretation: 'RSI: 78.77',
    //       },
    //       {
    //         name: 'VWAP',
    //         value: 1.770802508033378,
    //         interpretation: 'VWAP: 1.77',
    //       },
    //       {
    //         name: 'Volume',
    //         value: 261823,
    //         interpretation: 'Volume: 261823.00',
    //       },
    //       {
    //         name: 'Average Volume',
    //         value: 51351.75,
    //         interpretation: 'Average volume: 51351.75',
    //       },
    //     ],
    //     timestamp: 1751282924497,
    //     strategyDetails: {
    //       name: 'Volume Swing 5m',
    //       symbol: 'BERAUSDT',
    //       interval: '5',
    //       limit: 200,
    //       minVolumeRatio: 3,
    //       minConfidence: 0.7,
    //       category: 'linear',
    //     },
    //     orderParams: {
    //       takeProfit: 3,
    //       stopLoss: 9,
    //       betSize: 5,
    //     },
    //   },
    // ] as StrategyAnalysisResult[];

    // await this.openOrdersBatch(test);

    return this.futuresPairModel.findById(id);
  }

  async startScanning(data: StartScanningDto): Promise<FuturesPair | null> {
    try {
      const futuresPair = await this.futuresPairModel.create({
        name: data.name,
        results: [],
        strategies: [],
        status: FuturesPairStatus.ACTIVE,
        cycleCount: 0,
        lastScanTime: new Date(),
        startegyScanningIntervalParams:
          this.strategiesHandlerService.getStartegyIntervalParams(),
      });

      if (!futuresPair) {
        this.logger.error(`Failed to create futures pair for ${data.name}`);
        return null;
      }

      const taskId = futuresPair._id.toString();
      this.pairScannerTaskMap.set(taskId, true);
      this.logger.log(
        `Started scanning for ${data.name} with taskId: ${taskId}`,
      );

      this.openOrdersBatch([
        {
          symbol: 'EPTUSDT',
          name: 'Volume Swing 5m',
          strategyType: StrategyType.VOLUME_ANALYSIS,
          recommendation: AnalysisResultRecommendation.BUY,
          confidence: 0.7036889762948331,
          currentPrice: 0.004237,
          interval: KlineInterval.FIVE_MINUTES,
          signals: [
            {
              name: 'Volume Spike',
              value: 5.514857117301698,
              interpretation: 'Volume 5.51x above average',
            },
            {
              name: 'OBV Trend',
              value: 53734110,
              interpretation: 'Accumulation/Distribution pattern detected',
            },
            {
              name: 'Price Action',
              value: 0.01844488147416526,
              interpretation: 'bullish momentum',
            },
            {
              name: 'RSI',
              value: 77.20472126418811,
              interpretation: 'RSI: 77.20',
            },
            {
              name: 'VWAP',
              value: 0.004477299882730757,
              interpretation: 'VWAP: 0.00',
            },
            {
              name: 'Volume',
              value: 13194610,
              interpretation: 'Volume: 13194610.00',
            },
            {
              name: 'Average Volume',
              value: 2392557,
              interpretation: 'Average volume: 2392557.00',
            },
          ],
          timestamp: 1751287749005,
          strategyDetails: {
            name: 'Volume Swing 5m',
            symbol: 'EPTUSDT',
            interval: '5',
            limit: 200,
            minVolumeRatio: 3,
            minConfidence: 0.7,
            category: 'linear',
          },
          orderParams: {
            takeProfit: 5,
            stopLoss: 9,
            betSize: 5,
          },
        },
      ]);
      this.runContinuousScanning(futuresPair);

      return futuresPair;
    } catch (error) {
      this.logger.error(`Error starting scanning for ${data.name}:`, error);
      return null;
    }
  }

  async resumeScanning(id: string): Promise<FuturesPair | null> {
    try {
      const futuresPair = await this.futuresPairModel.findById(id);

      if (!futuresPair) {
        this.logger.error(`Futures pair not found with id: ${id}`);
        return null;
      }

      const taskId = futuresPair._id.toString();

      // Перевіряємо чи сканування вже запущене
      if (this.pairScannerTaskMap.has(taskId)) {
        this.logger.warn(`Scanning is already active for taskId: ${taskId}`);
        return futuresPair;
      }

      // Перевіряємо чи статус дозволяє продовжити сканування
      // if (futuresPair.status !== FuturesPairStatus.STOPPED) {
      //   this.logger.warn(
      //     `Cannot resume scanning for taskId: ${taskId}. Status is: ${futuresPair.status}`,
      //   );
      //   return futuresPair;
      // }

      // Оновлюємо статус на ACTIVE
      const updatedPair = await this.futuresPairModel.findByIdAndUpdate(
        id,
        {
          $set: {
            status: FuturesPairStatus.ACTIVE,
            lastScanTime: new Date(),
          },
        },
        { new: true },
      );

      if (!updatedPair) {
        this.logger.error(`Failed to update futures pair status for id: ${id}`);
        return null;
      }

      // Додаємо задачу до карти активних сканувань
      this.pairScannerTaskMap.set(taskId, true);
      this.logger.log(
        `Resumed scanning for ${updatedPair.name} with taskId: ${taskId}`,
      );

      // Запускаємо безперервне сканування
      this.runContinuousScanning(updatedPair);

      return updatedPair;
    } catch (error) {
      this.logger.error(`Error resuming scanning for id ${id}:`, error);
      return null;
    }
  }

  async stopScanning(id: string): Promise<FuturesPair | null> {
    try {
      const futuresPair = await this.futuresPairModel.findById(id);

      if (!futuresPair) {
        this.logger.error(`Futures pair not found with id: ${id}`);
        return null;
      }

      const taskId = futuresPair._id.toString();

      // Перевіряємо чи сканування активне
      if (!this.pairScannerTaskMap.has(taskId)) {
        this.logger.warn(`Scanning is not active for taskId: ${taskId}`);
        return futuresPair;
      }

      // Видаляємо задачу з карти активних сканувань
      this.pairScannerTaskMap.delete(taskId);
      this.scanInProgress.delete(taskId);

      // Оновлюємо статус на STOPPED
      const updatedPair = await this.futuresPairModel.findByIdAndUpdate(
        id,
        {
          $set: {
            status: FuturesPairStatus.STOPPED,
            lastScanTime: new Date(),
          },
        },
        { new: true },
      );

      if (!updatedPair) {
        this.logger.error(`Failed to update futures pair status for id: ${id}`);
        return null;
      }

      this.logger.log(
        `Stopped scanning for ${updatedPair.name} with taskId: ${taskId}`,
      );

      return updatedPair;
    } catch (error) {
      this.logger.error(`Error stopping scanning for id ${id}:`, error);
      return null;
    }
  }

  async getScanningStatus(id: string): Promise<{
    isActive: boolean;
    status: FuturesPairStatus;
    lastScanTime?: Date;
    cycleCount: number;
  } | null> {
    try {
      const futuresPair = await this.futuresPairModel.findById(id);

      if (!futuresPair) {
        this.logger.error(`Futures pair not found with id: ${id}`);
        return null;
      }

      const taskId = futuresPair._id.toString();
      const isActive = this.pairScannerTaskMap.has(taskId);

      return {
        isActive,
        status: futuresPair.status,
        lastScanTime: futuresPair.lastScanTime,
        cycleCount: futuresPair.cycleCount,
      };
    } catch (error) {
      this.logger.error(`Error getting scanning status for id ${id}:`, error);
      return null;
    }
  }

  private async runContinuousScanning(futuresPair: FuturesPair): Promise<void> {
    const taskId = futuresPair._id.toString();

    try {
      while (this.pairScannerTaskMap.has(taskId)) {
        const updatedPair = await this.futuresPairModel.findById(
          futuresPair._id,
        );

        if (!updatedPair || updatedPair.status !== FuturesPairStatus.ACTIVE) {
          this.logger.log(`Scanning stopped for: ${taskId}`);
          break;
        }

        if (this.scanInProgress.get(taskId)) {
          await this.sleep(1000);
          continue;
        }

        try {
          this.scanInProgress.set(taskId, true);
          await this.runAnalysis(taskId);
        } catch (error) {
          this.logger.error(`Error executing strategy for ${taskId}:`, error);
        } finally {
          this.scanInProgress.set(taskId, false);
        }

        this.logger.log('Waiting for next scan...');
        await this.sleep(this.SCAN_INTERVAL);
      }
    } catch (error) {
      this.logger.error(`Error in continuous scanning for ${taskId}:`, error);
    } finally {
      this.cleanupTask(taskId);
    }
  }

  async saveSignal(
    taskId: string,
    signalsData: StrategyAnalysisResult[],
  ): Promise<StrategyAnalysisResult[]> {
    try {
      const signals = signalsData.filter(
        (item) => item.recommendation !== AnalysisResultRecommendation.HOLD,
      );

      if (!taskId || !signals?.length) {
        this.logger.warn('Invalid input parameters for saveSignal');
        return [];
      }

      const futuresPair = await this.futuresPairModel.findById(taskId);
      if (!futuresPair) {
        this.logger.warn(`Futures pair not found for taskId: ${taskId}`);
        return [];
      }

      const results: StrategyAnalysisResult[] = [];
      const now = new Date();

      for (const signal of signals) {
        try {
          if (!this.isValidSignal(signal)) {
            this.logger.warn('Invalid signal data:', signal);
            continue;
          }

          const lastSignal = this.findLastSignal(futuresPair.results, signal);
          if (!lastSignal) {
            results.push(signal);
            continue;
          }

          if (this.shouldSaveSignal(lastSignal, now)) {
            results.push(signal);
          } else {
            // this.logSkippedSignal(signal, lastSignal, now);
          }
        } catch (error) {
          this.logger.error(
            `Error processing signal for ${signal?.symbol}:`,
            error,
          );
        }
      }

      await this.saveResultsToDatabase(taskId, results, now);
      return results;
    } catch (error) {
      this.logger.error(`Error in saveSignal for taskId ${taskId}:`, error);
    }
  }

  private isValidSignal(signal: StrategyAnalysisResult): boolean {
    return !!(
      signal?.symbol &&
      signal?.strategyType &&
      signal?.interval &&
      signal?.name
    );
  }

  private findLastSignal(
    results: StrategyAnalysisResult[],
    signal: StrategyAnalysisResult,
  ): StrategyAnalysisResult | undefined {
    return findLast(results, (item) => {
      return (
        item.symbol === signal.symbol &&
        item.strategyType === signal.strategyType &&
        item.interval === signal.interval &&
        item.name === signal.name
      );
    });
  }

  private shouldSaveSignal(
    lastSignal: StrategyAnalysisResult,
    now: Date,
  ): boolean {
    const lastSignalDate = new Date(lastSignal.timestamp);
    const minNextSignalDate = addMinutes(
      lastSignalDate,
      this.PAUSE_IN_MINUTES_BETWEEN_SIGNALS,
    );
    return isAfter(now, minNextSignalDate);
  }

  private logSkippedSignal(
    signal: StrategyAnalysisResult,
    lastSignal: StrategyAnalysisResult,
    now: Date,
  ): void {
    const lastSignalDate = new Date(lastSignal.timestamp);
    const minNextSignalDate = addMinutes(
      lastSignalDate,
      this.PAUSE_IN_MINUTES_BETWEEN_SIGNALS,
    );
    const timeUntilNextSignal = differenceInMilliseconds(
      minNextSignalDate,
      now,
    );
    this.logger.debug(
      `Skipping signal for ${signal.symbol} (${signal.name}). Next signal available in ${Math.round(
        timeUntilNextSignal / 1000 / 60,
      )} minutes`,
    );
  }

  private async saveResultsToDatabase(
    taskId: string,
    results: StrategyAnalysisResult[],
    now: Date,
  ): Promise<void> {
    if (results.length > 0) {
      await this.futuresPairModel.findByIdAndUpdate(
        taskId,
        {
          $push: { results: { $each: results } },
          $set: { lastScanTime: now },
        },
        { new: true },
      );
      this.logger.log(
        `Saved ${results.length} new signals for taskId: ${taskId}`,
      );
    } else {
      this.logger.debug(`No new signals to save for taskId: ${taskId}`);
    }
  }

  async runAnalysis(taskId: string): Promise<StrategyAnalysisResult[]> {
    try {
      const updatedPair = await this.futuresPairModel.findById(taskId);

      if (!updatedPair) {
        this.logger.warn(`Futures pair not found for taskId: ${taskId}`);
        return [];
      }

      // Ініціалізуємо параметри сканування, якщо вони відсутні
      // if (!updatedPair.startegyScanningIntervalParams) {
      //   // await this.initializeScanningParams(taskId);
      //   // Отримуємо оновлений об'єкт після ініціалізації
      //   const refreshedPair = await this.futuresPairModel.findById(taskId);
      //   if (refreshedPair) {
      //     updatedPair.startegyScanningIntervalParams =
      //       refreshedPair.startegyScanningIntervalParams;
      //   }
      // }

      const strategies =
        this.strategiesHandlerService.getDefaultGropedStrategies();

      if (isEmpty(strategies)) {
        this.logger.warn('No strategies configured for analysis');
        return [];
      }

      const results: StrategyAnalysisResult[] = [];
      const now = new Date();

      for (const [interval, items] of Object.entries(strategies)) {
        try {
          // Перевіряємо чи потрібно виконувати сканування для цього інтервалу
          if (
            !this.shouldScanInterval(
              interval as KlineInterval,
              updatedPair.startegyScanningIntervalParams,
              now,
            )
          ) {
            this.logger.debug(
              `Skipping scan for interval ${interval} - too early`,
            );
            await this.sleep(20000);
            continue;
          }

          this.logger.log(`Processing interval: ${interval}`);
          const resultsInterval =
            await this.strategiesHandlerService.getStrategiesAnalysisResults(
              interval as KlineInterval,
              items,
            );

          if (resultsInterval.length > 0) {
            const savedResults = await this.saveSignal(taskId, resultsInterval);
            results.push(...savedResults);
            if (savedResults.length > 0) {
              await this.openOrdersBatch(savedResults);
            }
          }

          // Оновлюємо час останнього сканування для цього інтервалу
          await this.updateLastScanTime(taskId, interval as KlineInterval, now);

          await this.sleep(1000);
        } catch (error) {
          this.logger.error(`Error processing interval ${interval}:`, error);
        }
      }

      if (updatedPair) {
        await this.futuresPairModel.findByIdAndUpdate(taskId, {
          $set: { cycleCount: updatedPair.cycleCount + 1 },
        });
      }

      return results;
    } catch (error) {
      this.logger.error('Error in runAnalysis:', error);
      return [];
    }
  }

  private shouldScanInterval(
    interval: KlineInterval,
    intervalParams: StartegyScanningIntervalParams,
    currentTime: Date,
  ): boolean {
    const intervalConfig = intervalParams[interval];

    if (!intervalConfig) {
      this.logger.warn(`No configuration found for interval: ${interval}`);
      return true;
    }

    if (!intervalConfig.lastSync || intervalConfig.count === 0) {
      this.logger.debug(`First scan for interval: ${interval}`);
      return true;
    }

    const lastSyncTime = new Date(intervalConfig.lastSync);
    const nextScanTime = addMinutes(
      lastSyncTime,
      intervalConfig.frequencyInMinutes,
    );

    const shouldScan = currentTime >= nextScanTime;

    if (!shouldScan) {
      const timeUntilNextScan = differenceInMilliseconds(
        nextScanTime,
        currentTime,
      );
      this.logger.debug(
        `Interval ${interval} scan skipped. Next scan in ${Math.round(timeUntilNextScan / 1000 / 60)} minutes`,
      );
    }

    return shouldScan;
  }

  /**
   * Оновлює час останнього сканування для конкретного інтервалу
   */
  private async updateLastScanTime(
    taskId: string,
    interval: KlineInterval,
    scanTime: Date,
  ): Promise<void> {
    try {
      await this.futuresPairModel.findByIdAndUpdate(taskId, {
        $set: {
          [`startegyScanningIntervalParams.${interval}.lastSync`]:
            scanTime.toISOString(),
        },
        $inc: {
          [`startegyScanningIntervalParams.${interval}.count`]: 1,
        },
      });

      this.logger.debug(`Updated last scan time for interval: ${interval}`);
    } catch (error) {
      this.logger.error(
        `Error updating last scan time for interval ${interval}:`,
        error,
      );
    }
  }

  private cleanupTask(taskId: string): void {
    this.pairScannerTaskMap.delete(taskId);
    this.scanInProgress.delete(taskId);
    this.logger.log(`Scanning process finished: ${taskId}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // private async openOrdersBatch(
  //   results: StrategyAnalysisResult[],
  // ): Promise<void> {
  //   try {
  //     // console.log('results', results);

  //     const createOrderDtos: CreateOrderDto[] = results.map((result) => ({
  //       symbol: result.symbol,
  //       side: result.recommendation,
  //       price: result.currentPrice,
  //       leverage: 10,
  //       takeProfit: result.orderParams.takeProfit,
  //       stopLoss: result.orderParams.stopLoss,
  //       betSize: result.orderParams.betSize,
  //     }));

  //     for (const orderDto of createOrderDtos) {
  //       try {
  //         console.log('woooooork');
  //         await this.bybitService.openFutureOrder(orderDto);
  //       } catch (error) {
  //         this.logger.error(
  //           `Error opening order for ${orderDto.symbol}:`,
  //           error,
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     this.logger.error('Error in openOrdersBatch:', error);
  //   }
  // }

  private async openOrdersBatch(
    results: StrategyAnalysisResult[],
  ): Promise<void> {
    try {
      // console.log('results', results);

      const createOrderDtos: LimitOrderParams[] = results.map((result) => {
        const side =
          result.recommendation === AnalysisResultRecommendation.BUY
            ? 'Sell'
            : 'Buy';

        const price = result.currentPrice * 1.004;
        const targetPrices =
          side === 'Buy'
            ? {
                profit: price * (1 + result.orderParams.takeProfit / 100),
                loss: price * (1 - result.orderParams.stopLoss / 100),
              }
            : {
                profit: price * (1 - result.orderParams.takeProfit / 100),
                loss: price * (1 + result.orderParams.stopLoss / 100),
              };

        const qty = Number(
          (
            Math.round((result.orderParams.betSize / Number(price)) * 100000) /
            100000
          ).toFixed(0),
        );

        return {
          symbol: result.symbol,
          side: side as OrderSideV5,
          qty: qty.toString(),
          price: price.toString(),
          takeProfit: targetPrices.profit.toString(),
          stopLoss: targetPrices.loss.toString(),
        };
      });

      for (const orderDto of createOrderDtos) {
        try {
          console.log('woooooork');
          await this.bybitService.openLimitOrder(orderDto);
        } catch (error) {
          this.logger.error(
            `Error opening order for ${orderDto.symbol}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in openOrdersBatch:', error);
    }
  }
}
