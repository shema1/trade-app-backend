import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuturesPair, FuturesPairStatus } from './schemas/futures-pair.schema';
import { StartScanningDto } from './dto/start-scanning.dto';
import { isEmpty, take } from 'lodash';
import { DEFAULT_STRATEGY_PARAMS_TEST } from 'src/momentum-ema-cross-strategy/constants/momentum-ema-cros-default-params';

import { BybitService } from 'src/bybit/bybit.service';
import { KlineCategory, KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { VolumeStrategyService } from 'src/volume-strategy/volume-strategy.service';
import { MomentumEmaCrossStrategyService } from 'src/momentum-ema-cross-strategy/momentum-ema-cross-strategy.service';
import { KlineDataItemBatch } from 'src/bybit/interfaces/responses.interface';
import { MomentumEmaStrategyItem } from 'src/momentum-ema-cross-strategy/interfaces/momentum-ema-srategy';
import { VolumeStrategyItem } from 'src/volume-strategy/interfaces/volume-srategy';
import { StrategiesHandlerService } from 'src/strategies-handler/strategies-handler.service';
import {
  Strategy,
  StrategyAnalysisResult,
  StrategyType,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

@Injectable()
export class FuturesPairScannerService {
  private readonly logger = new Logger(FuturesPairScannerService.name);
  private readonly pairScannerTaskMap: Map<string, boolean> = new Map();
  private readonly scanInProgress: Map<string, boolean> = new Map();
  private readonly SCAN_INTERVAL = 120000;
  private readonly BATCH_SIZE = 50;

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
        strategies: DEFAULT_STRATEGY_PARAMS_TEST,
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

  async saveSignal(taskId: string, signal: StrategyAnalysisResult[]) {
    const futuresPair = await this.futuresPairModel.findById(taskId);
    if (!futuresPair) {
      this.logger.warn(`Futures pair not found for taskId: ${taskId}`);
      return;
    }
  }

  async runAnalysis(taskId: string): Promise<StrategyAnalysisResult[]> {
    // async runAnalysis(): Promise<any> {
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
          results.push(...resultsInterval);
          await this.sleep(1000);
        } catch (error) {
          this.logger.error(`Error processing interval ${interval}:`, error);
        }
      }

      // return results;
      // return results.filter((item) => item?.confidence > 0.1);
      // return take(results, 10);
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
