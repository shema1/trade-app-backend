import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuturesPair, FuturesPairStatus } from './schemas/futures-pair.schema';
import { StartScanningDto } from './dto/start-scanning.dto';
import { flattenDeep, groupBy, map } from 'lodash';
import { DEFAULT_STRATEGY_PARAMS_TEST } from 'src/momentum-ema-cross-strategy/constants/momentum-ema-cros-default-params';
import { VOLUME_DEFAULT_STRATEGY_PARAMS_TEST } from 'src/volume-strategy/constants/volume-default-params';
import {
  FuturesPairStrategy,
  StrategyType,
  AnalysisResult,
} from './interfaces/analysis-result';
import { BybitService } from 'src/bybit/bybit.service';
import { KlineCategory, KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { VolumeStrategyService } from 'src/volume-strategy/volume-strategy.service';
import { MomentumEmaCrossStrategyService } from 'src/momentum-ema-cross-strategy/momentum-ema-cross-strategy.service';
import { KlineDataItemBatch } from 'src/bybit/interfaces/responses.interface';
import { MomentumEmaStrategyItem } from 'src/momentum-ema-cross-strategy/interfaces/momentum-ema-srategy';
import { VolumeStrategyItem } from 'src/volume-strategy/interfaces/volume-srategy';

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
          await this.runAnalysis();
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

  private async getStrategyResult(
    item: FuturesPairStrategy,
    kline: KlineDataItemBatch,
  ): Promise<AnalysisResult | null> {
    try {
      if (item.strategyType === StrategyType.MOMENTUM_EMA_CROSS) {
        const params = item.params as MomentumEmaStrategyItem;
        return await this.momentumEmaCrossStrategyService.momentumEmaCrossStrategy(
          {
            symbol: kline.symbol,
            interval: item.params.interval,
            kline: kline.list,
            limit: item.params.limit,
            minPriceChangePercent: params.minPriceChangePercent,
            minAdxStrength: params.minAdxStrength,
            minVolatilityPercent: params.minVolatilityPercent,
            emaShortPeriod: params.emaShortPeriod,
            emaLongPeriod: params.emaLongPeriod,
            maxAtrPercent: params.maxAtrPercent,
            trendOnly: params.trendOnly,
            dynamicAtrFilter: params.dynamicAtrFilter,
            confidenceValue: params.confidenceValue,
            category: kline.category as KlineCategory,
          },
        );
      } else if (item.strategyType === StrategyType.VOLUME_ANALYSIS) {
        const params = item.params as VolumeStrategyItem;
        return await this.volumeStrategyService.analyzeVolume({
          symbol: kline.symbol,
          interval: item.params.interval,
          kline: kline.list,
          limit: params.limit,
          minVolumeRatio: params.minVolumeRatio,
          minConfidence: params.minConfidence,
          category: kline.category as KlineCategory,
        });
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Error in getStrategyResult for ${kline.symbol}:`,
        error,
      );
      return null;
    }
  }

  async checkStrategies(
    items: FuturesPairStrategy[],
    kline: KlineDataItemBatch,
  ): Promise<AnalysisResult[]> {
    try {
      const strategyPromises = items.map((item) =>
        this.getStrategyResult(item, kline),
      );
      const results = await Promise.all(strategyPromises);
      return results.filter(
        (result): result is AnalysisResult => result !== null,
      );
    } catch (error) {
      this.logger.error(`Error in checkStrategies for ${kline.symbol}:`, error);
      return [];
    }
  }

  async runAnalysis(): Promise<any> {
    try {
      const strategies = [
        ...DEFAULT_STRATEGY_PARAMS_TEST,
        ...VOLUME_DEFAULT_STRATEGY_PARAMS_TEST,
      ];

      const grouped = groupBy(strategies, 'params.interval');
      const analysisPromises = map(
        grouped,
        async (items: FuturesPairStrategy[], key) => {
          try {
            const kline = await this.bybitService.getKlineDataBatch({
              symbols: [],
              interval: key as KlineInterval,
              category: KlineCategory.LINEAR,
              limit: 500,
            });

            if (!kline.length) {
              return null;
            }

            const batchPromises = kline.map((klineItem) =>
              this.checkStrategies(items, klineItem),
            );

            return await Promise.all(batchPromises);
          } catch (error) {
            this.logger.error(`Error processing interval ${key}:`, error);
            return null;
          }
        },
      );

      const results = await Promise.all(analysisPromises);
      const a = flattenDeep(
        results.filter((item): item is any[] => item !== null),
      );
      return a.filter((item) => item.confidence > 0);
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
