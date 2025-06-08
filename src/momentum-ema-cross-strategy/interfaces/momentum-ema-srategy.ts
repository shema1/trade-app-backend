import { StrategyParams } from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

export interface MomentumEmaStrategyItem extends StrategyParams {
  minAdxStrength: number;
  minPriceChangePercent: number;
  minVolatilityPercent: number;
  emaShortPeriod: number;
  emaLongPeriod: number;
  maxAtrPercent: number;
  trendOnly: boolean;
  dynamicAtrFilter: boolean;
  // minConfidence: number;
  // category: KlineCategory;
}
