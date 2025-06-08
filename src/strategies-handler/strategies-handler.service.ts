import { Injectable, Logger } from '@nestjs/common';
import { groupBy } from 'lodash';
import {
  GroupedStrategies,
  Strategy,
  StrategyAnalysisResult,
} from './interfaces/strategies-handler-common.interface';
import { DEFAULT_STRATEGY_PARAMS_TEST } from 'src/momentum-ema-cross-strategy/constants/momentum-ema-cros-default-params';
import { VOLUME_DEFAULT_STRATEGY_PARAMS_TEST } from 'src/volume-strategy/constants/volume-default-params';
import { KlineDataItemBatch } from 'src/bybit/interfaces/responses.interface';

@Injectable()
export class StrategiesHandlerService {
  private readonly logger = new Logger(StrategiesHandlerService.name);

  getDefaultGropedStrategies(): GroupedStrategies {
    try {
      const strategies = [
        ...DEFAULT_STRATEGY_PARAMS_TEST,
        ...VOLUME_DEFAULT_STRATEGY_PARAMS_TEST,
      ];

      return groupBy(strategies, 'params.interval');
    } catch (error) {
      this.logger.error('Error in getStrategies:', error);
      return {};
    }
  }

  async checkStrategies(
    items: Strategy[],
    kline: KlineDataItemBatch,
  ): Promise<StrategyAnalysisResult[]> {
    // try {
    //   if (!items?.length) {
    //     this.logger.warn('No strategies provided for check');
    //     return [];
    //   }

    //   const strategyPromises = items.map((item) =>
    //     this.getStrategyResult(item, kline),
    //   );
    //   const results = await Promise.allSettled(strategyPromises);

    //   return results
    //     .filter(
    //       (
    //         result,
    //       ): result is PromiseFulfilledResult<StrategyAnalysisResult | null> =>
    //         result.status === 'fulfilled' && result.value !== null,
    //     )
    //     .map((result) => result.value);
    // } catch (error) {
    //   this.logger.error(`Error in checkStrategies for ${kline.symbol}:`, error);
    //   return [];
    // }
    return [];
  }
}
