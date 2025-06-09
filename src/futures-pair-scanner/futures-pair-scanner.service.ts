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
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

@Injectable()
export class FuturesPairScannerService {
  private readonly logger = new Logger(FuturesPairScannerService.name);
  private readonly pairScannerTaskMap: Map<string, boolean> = new Map();
  private readonly scanInProgress: Map<string, boolean> = new Map();
  private readonly SCAN_INTERVAL = 120000;
  private readonly BATCH_SIZE = 50;
  private readonly PAUSE_IN_MINUTES_BETWEEN_SIGNALS = 30;

  constructor(
    @InjectModel(FuturesPair.name)
    private readonly futuresPairModel: Model<FuturesPair>,
    private readonly bybitService: BybitService,
    private readonly momentumEmaCrossStrategyService: MomentumEmaCrossStrategyService,
    private readonly volumeStrategyService: VolumeStrategyService,
    private readonly strategiesHandlerService: StrategiesHandlerService,
  ) {}

  async startScanning(data: StartScanningDto): Promise<FuturesPair | null> {
    try {
      const futuresPair = await this.futuresPairModel.create({
        name: data.name,
        results: [],
        strategies: [],
        status: FuturesPairStatus.ACTIVE,
        cycleCount: 0,
        lastScanTime: new Date(),
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

      this.runContinuousScanning(futuresPair);

      return futuresPair;
    } catch (error) {
      this.logger.error(`Error starting scanning for ${data.name}:`, error);
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
  ): Promise<void> {
    try {
      const signals = signalsData.filter(
        (item) => item.recommendation !== AnalysisResultRecommendation.HOLD,
      );

      if (!taskId || !signals?.length) {
        this.logger.warn('Invalid input parameters for saveSignal');
        return;
      }

      const futuresPair = await this.futuresPairModel.findById(taskId);
      if (!futuresPair) {
        this.logger.warn(`Futures pair not found for taskId: ${taskId}`);
        return;
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
      const strategies =
        this.strategiesHandlerService.getDefaultGropedStrategies();
      if (isEmpty(strategies)) {
        this.logger.warn('No strategies configured for analysis');
        return [];
      }

      const results: StrategyAnalysisResult[] = [];

      for (const [interval, items] of Object.entries(strategies)) {
        try {
          this.logger.log(`Processing interval: ${interval}`);
          const resultsInterval =
            await this.strategiesHandlerService.getStrategiesAnalysisResults(
              interval as KlineInterval,
              items,
            );
          await this.saveSignal(taskId, resultsInterval);
          results.push(...resultsInterval);
          await this.sleep(1000);
        } catch (error) {
          this.logger.error(`Error processing interval ${interval}:`, error);
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Error in runAnalysis:', error);
      return [];
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
}
