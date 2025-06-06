import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuturesPair, FuturesPairStatus } from './schemas/futures-pair.schema';
import { StartScanningDto } from './dto/start-scanning.dto';
import { groupBy, map } from 'lodash';
import { DEFAULT_STRATEGY_PARAMS_TEST } from 'src/momentum-ema-cross-strategy/constants/momentum-ema-cros-default-params';
import { VOLUME_DEFAULT_STRATEGY_PARAMS_TEST } from 'src/volume-strategy/constants/volume-default-params';
import {
  FuturesPairStrategy,
  StrategyType,
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
  private pairScannerTaskMap: Map<string, boolean> = new Map();
  private scanInProgress: Map<string, boolean> = new Map();
  private readonly SCAN_INTERVAL = 120000;

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
        return null;
      }

      const taskId = futuresPair._id.toString();
      this.pairScannerTaskMap.set(taskId, true);

      // this.runContinuousScanning(futuresPair);

      return futuresPair;
    } catch (error) {
      console.error(`Error starting scanning for ${data.name}:`, error);
      return null;
    }
  }

  private async runContinuousScanning(futuresPair: FuturesPair): Promise<void> {
    const taskId = futuresPair._id.toString();

    try {
      while (true) {
        // Перевіряємо чи не зупинено сканування
        const updatedPair = await this.futuresPairModel.findById(
          futuresPair._id,
        );
        if (
          !updatedPair ||
          updatedPair.status !== 'ACTIVE' ||
          !this.pairScannerTaskMap.has(taskId)
        ) {
          console.log('Scanning stopped for:', taskId);
          break;
        }

        // Перевіряємо чи не виконується вже сканування
        if (this.scanInProgress.get(taskId)) {
          await this.sleep(1000);
          continue;
        }

        try {
          this.scanInProgress.set(taskId, true);
          // await this.checkStrategies(futuresPair);
        } catch (error) {
          console.error(`Error executing strategy for ${taskId}:`, error);
        } finally {
          this.scanInProgress.set(taskId, false);
        }

        // Чекаємо перед наступним скануванням
        console.log('Waiting for next scan...');
        await this.sleep(this.SCAN_INTERVAL);
      }
    } catch (error) {
      console.error(`Error in continuous scanning for ${taskId}:`, error);
    } finally {
      // Прибираємо таску при завершенні
      this.pairScannerTaskMap.delete(taskId);
      this.scanInProgress.delete(taskId);
      console.log('Scanning process finished:', taskId);
    }
  }

  private async getStrategyResult(
    item: FuturesPairStrategy,
    kline: KlineDataItemBatch,
  ) {
    if (item.strategyType === StrategyType.MOMENTUM_EMA_CROSS) {
      const {
        minPriceChangePercent,
        minAdxStrength,
        minVolatilityPercent,
        emaShortPeriod,
        emaLongPeriod,
        maxAtrPercent,
        trendOnly,
        dynamicAtrFilter,
        confidenceValue,
      } = item.params as MomentumEmaStrategyItem;
      return this.momentumEmaCrossStrategyService.momentumEmaCrossStrategy({
        symbol: kline.symbol,
        interval: item.params.interval,
        kline: kline.list,
        limit: item.params.limit,
        minPriceChangePercent: minPriceChangePercent,
        minAdxStrength: minAdxStrength,
        minVolatilityPercent: minVolatilityPercent,
        emaShortPeriod: emaShortPeriod,
        emaLongPeriod: emaLongPeriod,
        maxAtrPercent: maxAtrPercent,
        trendOnly: trendOnly,
        dynamicAtrFilter: dynamicAtrFilter,
        confidenceValue: confidenceValue,
        category: kline.category as KlineCategory,
      });
    } else if (item.strategyType === StrategyType.VOLUME_ANALYSIS) {
      const { minVolumeRatio, limit, minConfidence } =
        item.params as VolumeStrategyItem;
      return this.volumeStrategyService.analyzeVolume({
        symbol: kline.symbol,
        interval: item.params.interval,
        kline: kline.list,
        limit: limit,
        minVolumeRatio,
        minConfidence,
        category: kline.category as KlineCategory,
      });
    }
  }

  async checkStrategies(
    items: FuturesPairStrategy[],
    kline: KlineDataItemBatch,
  ) {
    const results = [];

    items.forEach(async (item) => {
      const result = await this.getStrategyResult(item, kline);
      results.push(result);
    });

    return results;
  }

  async runAnalysis() // futuresPair: FuturesPair
  : Promise<any> {
    try {
      const strategies = [
        ...DEFAULT_STRATEGY_PARAMS_TEST,
        ...VOLUME_DEFAULT_STRATEGY_PARAMS_TEST,
      ];

      const grouped = groupBy(strategies, 'params.interval');

      // console.log('grouped', grouped);

      const a = await map(
        grouped,
        async (items: FuturesPairStrategy[], key) => {
          const kline = await this.bybitService.getKlineDataBatch({
            symbols: [],
            interval: key as KlineInterval,
            category: KlineCategory.LINEAR,
            limit: 100,
          });
          if (kline.length) {
            const results = kline.map(async (klineItem) => {
              return await this.checkStrategies(items, klineItem);
            });
            return results;
          }
          return null;
        },
      );

      return a.filter((item) => item !== null);
    } catch (error) {
      console.error('Error in executeStrategy:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
