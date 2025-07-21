import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { VolumeStrategyItem } from '../interfaces/volume-srategy';
import {
  Strategy,
  StrategyType,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

const SWING_PARAMS = {
  minVolumeRatio: 3.0,
  minConfidence: 0.7,
  limit: 200,
};

const RANGE_MASTER_PARAMS = {
  minVolumeRatio: 3.8,
  minConfidence: 0.8,
  limit: 110,
};

export const VOLUME_DEFAULT_STRATEGY_PARAMS_V1: Strategy[] = [
  // 5 хвилин - Середній термін

  {
    strategyType: StrategyType.VOLUME_ANALYSIS,
    params: {
      name: 'Volume Swing 5m',
      interval: KlineInterval.FIVE_MINUTES,
      ...SWING_PARAMS,
    } as VolumeStrategyItem,
    orderParams: {
      takeProfit: 5,
      stopLoss: 9,
      betSize: 5,
    },
  },

  //10/-7
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Range Master D',
  //     interval: KlineInterval.ONE_DAY,
  //     ...RANGE_MASTER_PARAMS,
  //   } as VolumeStrategyItem,
  //   orderParams: {
  //     takeProfit: 10,
  //     stopLoss: 7,
  //     betSize: 10,
  //   },
  // },
];

// export const VOLUME_DEFAULT_STRATEGY_PARAMS_V1: Strategy[] = [
//   // 5 хвилин - Середній термін

//   {
//     strategyType: StrategyType.VOLUME_ANALYSIS,
//     params: {
//       name: 'Volume Swing 5m',
//       interval: KlineInterval.FIVE_MINUTES,
//       ...SWING_PARAMS,
//     } as VolumeStrategyItem,
//     orderParams: {
//       takeProfit: 3,
//       stopLoss: 9,
//       betSize: 5,
//     },
//   },

//   //10/-7
//   {
//     strategyType: StrategyType.VOLUME_ANALYSIS,
//     params: {
//       name: 'Volume Range Master D',
//       interval: KlineInterval.ONE_DAY,
//       ...RANGE_MASTER_PARAMS,
//     } as VolumeStrategyItem,
//     orderParams: {
//       takeProfit: 10,
//       stopLoss: 7,
//       betSize: 10,
//     },
//   },
// ];
