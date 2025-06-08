import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { VolumeStrategyItem } from '../interfaces/volume-srategy';
import {
  Strategy,
  StrategyType,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

// Базові параметри для різних типів стратегій
const AGGRESSIVE_PARAMS = {
  minVolumeRatio: 5.0,
  minConfidence: 0.9,
  limit: 100,
};

const MODERATE_PARAMS = {
  minVolumeRatio: 3.5,
  minConfidence: 0.75,
  limit: 75,
};

const CONSERVATIVE_PARAMS = {
  minVolumeRatio: 2.5,
  minConfidence: 0.6,
  limit: 50,
};

const SCALPING_PARAMS = {
  minVolumeRatio: 4.0,
  minConfidence: 0.8,
  limit: 30,
};

const SWING_PARAMS = {
  minVolumeRatio: 3.0,
  minConfidence: 0.7,
  limit: 200,
};

// Нові типи стратегій
const ULTRA_SCALPING_PARAMS = {
  minVolumeRatio: 6.0,
  minConfidence: 0.95,
  limit: 20,
};

const BREAKOUT_PARAMS = {
  minVolumeRatio: 4.5,
  minConfidence: 0.85,
  limit: 150,
};

const TREND_FOLLOWING_PARAMS = {
  minVolumeRatio: 3.2,
  minConfidence: 0.65,
  limit: 100,
};

const REVERSAL_PARAMS = {
  minVolumeRatio: 4.2,
  minConfidence: 0.75,
  limit: 80,
};

const VOLATILITY_PARAMS = {
  minVolumeRatio: 3.8,
  minConfidence: 0.7,
  limit: 60,
};

// Додаткові типи стратегій
const MOMENTUM_PARAMS = {
  minVolumeRatio: 4.8,
  minConfidence: 0.82,
  limit: 40,
};

const RANGE_BOUND_PARAMS = {
  minVolumeRatio: 3.3,
  minConfidence: 0.68,
  limit: 90,
};

const ACCUMULATION_PARAMS = {
  minVolumeRatio: 3.6,
  minConfidence: 0.72,
  limit: 120,
};

const DISTRIBUTION_PARAMS = {
  minVolumeRatio: 4.3,
  minConfidence: 0.78,
  limit: 110,
};

const HIGH_FREQUENCY_PARAMS = {
  minVolumeRatio: 5.5,
  minConfidence: 0.92,
  limit: 25,
};

const POSITION_TRADING_PARAMS = {
  minVolumeRatio: 2.8,
  minConfidence: 0.62,
  limit: 250,
};

const NEWS_BASED_PARAMS = {
  minVolumeRatio: 5.2,
  minConfidence: 0.88,
  limit: 35,
};

const GAP_TRADING_PARAMS = {
  minVolumeRatio: 4.7,
  minConfidence: 0.84,
  limit: 45,
};

export const VOLUME_DEFAULT_STRATEGY_PARAMS_TEST: Strategy[] = [
  // 1 хвилина - Скальпінг
  {
    strategyType: StrategyType.VOLUME_ANALYSIS,
    params: {
      name: 'Volume Ultra Scalping 1m',
      interval: KlineInterval.ONE_MINUTE,
      ...ULTRA_SCALPING_PARAMS,
    } as VolumeStrategyItem,
  },
  {
    strategyType: StrategyType.VOLUME_ANALYSIS,
    params: {
      name: 'Volume High Frequency 1m',
      interval: KlineInterval.ONE_MINUTE,
      ...HIGH_FREQUENCY_PARAMS,
    } as VolumeStrategyItem,
  },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Scalping 1m',
  //     interval: KlineInterval.ONE_MINUTE,
  //     ...SCALPING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Aggressive 1m',
  //     interval: KlineInterval.ONE_MINUTE,
  //     ...AGGRESSIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 3 хвилини - Короткий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Momentum 3m',
  //     interval: KlineInterval.THREE_MINUTES,
  //     ...MOMENTUM_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Volatility 3m',
  //     interval: KlineInterval.THREE_MINUTES,
  //     ...VOLATILITY_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Moderate 3m',
  //     interval: KlineInterval.THREE_MINUTES,
  //     ...MODERATE_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Conservative 3m',
  //     interval: KlineInterval.THREE_MINUTES,
  //     ...CONSERVATIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 5 хвилин - Середній термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume News Based 5m',
  //     interval: KlineInterval.FIVE_MINUTES,
  //     ...NEWS_BASED_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Breakout 5m',
  //     interval: KlineInterval.FIVE_MINUTES,
  //     ...BREAKOUT_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Swing 5m',
  //     interval: KlineInterval.FIVE_MINUTES,
  //     ...SWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Aggressive 5m',
  //     interval: KlineInterval.FIVE_MINUTES,
  //     ...AGGRESSIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 15 хвилин - Середній термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Gap Trading 15m',
  //     interval: KlineInterval.FIFTEEN_MINUTES,
  //     ...GAP_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Trend Following 15m',
  //     interval: KlineInterval.FIFTEEN_MINUTES,
  //     ...TREND_FOLLOWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Moderate 15m',
  //     interval: KlineInterval.FIFTEEN_MINUTES,
  //     ...MODERATE_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Conservative 15m',
  //     interval: KlineInterval.FIFTEEN_MINUTES,
  //     ...CONSERVATIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 15 хвилин - Range Bound
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Range Bound 15m',
  //     interval: KlineInterval.FIFTEEN_MINUTES,
  //     ...RANGE_BOUND_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 30 хвилин - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Accumulation 30m',
  //     interval: KlineInterval.THIRTY_MINUTES,
  //     ...ACCUMULATION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Reversal 30m',
  //     interval: KlineInterval.THIRTY_MINUTES,
  //     ...REVERSAL_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Swing 30m',
  //     interval: KlineInterval.THIRTY_MINUTES,
  //     ...SWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Aggressive 30m',
  //     interval: KlineInterval.THIRTY_MINUTES,
  //     ...AGGRESSIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 15 хвилин - Range Bound
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Range Bound 30m',
  //     interval: KlineInterval.THIRTY_MINUTES,
  //     ...RANGE_BOUND_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 1 година - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading 1h',
  //     interval: KlineInterval.ONE_HOUR,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Distribution 1h',
  //     interval: KlineInterval.ONE_HOUR,
  //     ...DISTRIBUTION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Breakout 1h',
  //     interval: KlineInterval.ONE_HOUR,
  //     ...BREAKOUT_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Swing 1h',
  //     interval: KlineInterval.ONE_HOUR,
  //     ...SWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Conservative 1h',
  //     interval: KlineInterval.ONE_HOUR,
  //     ...CONSERVATIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 1 година - Range Bound
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Range Bound 1h',
  //     interval: KlineInterval.ONE_HOUR,
  //     ...RANGE_BOUND_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 2 години - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading 2h',
  //     interval: KlineInterval.TWO_HOURS,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Distribution 2h',
  //     interval: KlineInterval.TWO_HOURS,
  //     ...DISTRIBUTION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Swing 2h',
  //     interval: KlineInterval.TWO_HOURS,
  //     ...SWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 4 години - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading 4h',
  //     interval: KlineInterval.FOUR_HOURS,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Accumulation 4h',
  //     interval: KlineInterval.FOUR_HOURS,
  //     ...ACCUMULATION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Conservative 4h',
  //     interval: KlineInterval.FOUR_HOURS,
  //     ...CONSERVATIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 4 години - Range Bound
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Range Bound 4h',
  //     interval: KlineInterval.FOUR_HOURS,
  //     ...RANGE_BOUND_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 6 годин - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading 6h',
  //     interval: KlineInterval.SIX_HOURS,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Distribution 6h',
  //     interval: KlineInterval.SIX_HOURS,
  //     ...DISTRIBUTION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Swing 6h',
  //     interval: KlineInterval.SIX_HOURS,
  //     ...SWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // 12 годин - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading 12h',
  //     interval: KlineInterval.TWELVE_HOURS,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Accumulation 12h',
  //     interval: KlineInterval.TWELVE_HOURS,
  //     ...ACCUMULATION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Conservative 12h',
  //     interval: KlineInterval.TWELVE_HOURS,
  //     ...CONSERVATIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // День - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading D',
  //     interval: KlineInterval.ONE_DAY,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Distribution D',
  //     interval: KlineInterval.ONE_DAY,
  //     ...DISTRIBUTION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Swing D',
  //     interval: KlineInterval.ONE_DAY,
  //     ...SWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // День - Range Bound
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Range Bound D',
  //     interval: KlineInterval.ONE_DAY,
  //     ...RANGE_BOUND_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // Тиждень - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading W',
  //     interval: KlineInterval.ONE_WEEK,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Accumulation W',
  //     interval: KlineInterval.ONE_WEEK,
  //     ...ACCUMULATION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Conservative W',
  //     interval: KlineInterval.ONE_WEEK,
  //     ...CONSERVATIVE_PARAMS,
  //   } as VolumeStrategyItem,
  // },

  // // Місяць - Довгий термін
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Position Trading M',
  //     interval: KlineInterval.ONE_MONTH,
  //     ...POSITION_TRADING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Distribution M',
  //     interval: KlineInterval.ONE_MONTH,
  //     ...DISTRIBUTION_PARAMS,
  //   } as VolumeStrategyItem,
  // },
  // {
  //   strategyType: StrategyType.VOLUME_ANALYSIS,
  //   params: {
  //     name: 'Volume Swing M',
  //     interval: KlineInterval.ONE_MONTH,
  //     ...SWING_PARAMS,
  //   } as VolumeStrategyItem,
  // },
];
