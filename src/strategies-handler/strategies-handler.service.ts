import { Injectable, Logger } from '@nestjs/common';
import { groupBy } from 'lodash';
import {
  GroupedStrategies,
  StartegyScanningIntervalParams,
  Strategy,
  StrategyAnalysisResult,
  StrategyType,
} from './interfaces/strategies-handler-common.interface';
import { DEFAULT_STRATEGY_PARAMS_TEST } from 'src/momentum-ema-cross-strategy/constants/momentum-ema-cros-default-params';
import { VOLUME_DEFAULT_STRATEGY_PARAMS_TEST } from 'src/volume-strategy/constants/volume-default-params';
import { KlineDataItemBatch } from 'src/bybit/interfaces/responses.interface';
import { BybitService } from 'src/bybit/bybit.service';
import { KlineCategory, KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { MomentumEmaStrategyItem } from 'src/momentum-ema-cross-strategy/interfaces/momentum-ema-srategy';
import { MomentumEmaCrossStrategyService } from 'src/momentum-ema-cross-strategy/momentum-ema-cross-strategy.service';
import { VolumeStrategyService } from 'src/volume-strategy/volume-strategy.service';
import { VolumeStrategyItem } from 'src/volume-strategy/interfaces/volume-srategy';

@Injectable()
export class StrategiesHandlerService {
  private readonly logger = new Logger(StrategiesHandlerService.name);

  constructor(
    private readonly bybitService: BybitService,
    private readonly momentumEmaCrossStrategyService: MomentumEmaCrossStrategyService,
    private readonly volumeStrategyService: VolumeStrategyService,
  ) {}

  getStartegyIntervalParams(): StartegyScanningIntervalParams {
    return {
      [KlineInterval.ONE_MINUTE]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 1,
      },
      [KlineInterval.FIVE_MINUTES]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 1,
      },
      [KlineInterval.FIFTEEN_MINUTES]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 2,
      },
      [KlineInterval.THIRTY_MINUTES]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 5,
      },
      [KlineInterval.ONE_HOUR]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 10,
      },
      [KlineInterval.FOUR_HOURS]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 30,
      },
      [KlineInterval.ONE_DAY]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 60,
      },
      [KlineInterval.ONE_WEEK]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 60,
      },
      [KlineInterval.ONE_MONTH]: {
        lastSync: '',
        count: 0,
        frequencyInMinutes: 60,
      },
    };
  }

  getDefaultGropedStrategies(): GroupedStrategies {
    try {
      const strategies = [
        ...DEFAULT_STRATEGY_PARAMS_TEST,
        ...VOLUME_DEFAULT_STRATEGY_PARAMS_TEST,
      ];

      if (!strategies?.length) {
        this.logger.warn('No strategies configured');
        return {};
      }

      return groupBy(strategies, 'params.interval');
    } catch (error) {
      this.logger.error('Error in getDefaultGropedStrategies:', error);
      return {};
    }
  }

  private async getStrategyResult(
    item: Strategy,
    kline: KlineDataItemBatch,
  ): Promise<StrategyAnalysisResult | null> {
    try {
      if (!item || !kline) {
        this.logger.warn('Invalid input parameters for getStrategyResult');
        return null;
      }

      if (!kline?.list?.length) {
        this.logger.warn(`No kline data for ${kline.symbol}`);
        return null;
      }

      if (item.strategyType === StrategyType.MOMENTUM_EMA_CROSS) {
        const params = item.params as MomentumEmaStrategyItem;
        if (!params) {
          this.logger.warn('Invalid momentum EMA strategy parameters');
          return null;
        }

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
            minConfidence: params.minConfidence,
            category: kline.category as KlineCategory,
            name: params.name,
          },
        );
      } else if (item.strategyType === StrategyType.VOLUME_ANALYSIS) {
        const params = item.params as VolumeStrategyItem;
        if (!params) {
          this.logger.warn('Invalid volume strategy parameters');
          return null;
        }

        return await this.volumeStrategyService.analyzeVolume({
          name: params.name,
          symbol: kline.symbol,
          interval: item.params.interval,
          kline: kline.list,
          limit: params.limit,
          minVolumeRatio: params.minVolumeRatio,
          minConfidence: params.minConfidence,
          category: kline.category as KlineCategory,
        });
      }

      this.logger.warn(`Unknown strategy type: ${item.strategyType}`);
      return null;
    } catch (error) {
      this.logger.error(
        `Error in getStrategyResult for ${kline?.symbol} with strategy ${item?.strategyType}:`,
        error,
      );
      return null;
    }
  }

  private async analyzeKlineDataItem(
    kline: KlineDataItemBatch,
    strategies: Strategy[],
  ): Promise<StrategyAnalysisResult[]> {
    try {
      if (!kline || !strategies?.length) {
        this.logger.warn('Invalid input parameters for analyzeKlineDataItem');
        return [];
      }

      const results = await Promise.allSettled(
        strategies.map((strategy) => this.getStrategyResult(strategy, kline)),
      );

      return results
        .filter(
          (result): result is PromiseFulfilledResult<StrategyAnalysisResult> =>
            result.status === 'fulfilled' && result.value !== null,
        )
        .map((result) => result.value);
    } catch (error) {
      this.logger.error(
        `Error in analyzeKlineDataItem for ${kline?.symbol}:`,
        error,
      );
      return [];
    }
  }

  private async analyzeKlineData(
    kline: KlineDataItemBatch[],
    strategies: Strategy[],
  ): Promise<StrategyAnalysisResult[]> {
    try {
      if (!kline?.length || !strategies?.length) {
        this.logger.warn('Invalid input parameters for analyzeKlineData');
        return [];
      }

      const results = await Promise.allSettled(
        kline.map((item) => this.analyzeKlineDataItem(item, strategies)),
      );

      return results
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<StrategyAnalysisResult[]> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value)
        .flat();
    } catch (error) {
      this.logger.error('Error in analyzeKlineData:', error);
      return [];
    }
  }

  async getStrategiesAnalysisResults(
    interval: KlineInterval,
    strategies: Strategy[],
  ): Promise<StrategyAnalysisResult[]> {
    try {
      if (!interval || !strategies?.length) {
        this.logger.warn(
          'Invalid input parameters for getStrategiesAnalysisResults',
        );
        return [];
      }

      const kline = await this.bybitService.getKlineDataBatch({
        symbols: [],
        interval: interval,
        category: KlineCategory.LINEAR,
        limit: 500,
      });

      if (!kline?.length) {
        this.logger.warn(`No kline data for interval ${interval}`);
        return [];
      }

      return await this.analyzeKlineData(kline, strategies);
    } catch (error) {
      this.logger.error(
        `Error in getStrategiesAnalysisResults for interval ${interval}:`,
        error,
      );
      return [];
    }
  }
}
