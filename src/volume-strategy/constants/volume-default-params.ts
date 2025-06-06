import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import {
  FuturesPairStrategy,
  StrategyType,
} from 'src/futures-pair-scanner/interfaces/analysis-result';
import { VolumeStrategyItem } from '../interfaces/volume-srategy';

const MIN_CONFIDENCE = 0.5;
export const VOLUME_DEFAULT_STRATEGY_PARAMS_TEST: FuturesPairStrategy[] = [
  {
    strategyType: StrategyType.VOLUME_ANALYSIS,
    // name: 'aaa',
    params: {
      name: 'Volume 1',
      interval: KlineInterval.ONE_MINUTE,
      minVolumeRatio: 3.5,
      minConfidence: MIN_CONFIDENCE,
      limit: 50,
    } as VolumeStrategyItem,
  },
  {
    strategyType: StrategyType.VOLUME_ANALYSIS,
    params: {
      name: 'Volume 2',
      interval: KlineInterval.THREE_MINUTES,
      minVolumeRatio: 2.5,
      minConfidence: MIN_CONFIDENCE,
      limit: 50,
    } as VolumeStrategyItem,
  },
];
