import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import {
  FuturesPairStrategy,
  StrategyType,
} from 'src/futures-pair-scanner/interfaces/analysis-result';
import { VolumeStrategyItem } from '../interfaces/volume-srategy';

export const DEFAULT_STRATEGY_PARAMS_TEST: FuturesPairStrategy[] = [
  {
    strategyType: StrategyType.VOLUME_ANALYSIS,
    // name: 'aaa',
    params: {
      interval: KlineInterval.ONE_MINUTE,
      minVolumeRatio: 3.5,
      minConfidence: 0.75,
      limit: 50,
    } as VolumeStrategyItem,
  },
  {
    strategyType: StrategyType.VOLUME_ANALYSIS,
    params: {
      interval: KlineInterval.THREE_MINUTES,
      minVolumeRatio: 2.5,
      minConfidence: 0.65,
      limit: 50,
    } as VolumeStrategyItem,
  },
];
