import { FuturesPairStrategyParams } from 'src/futures-pair-scanner/interfaces/analysis-result';

export interface MomentumEmaStrategyItem extends FuturesPairStrategyParams {
  minAdxStrength: number;
  minPriceChangePercent: number;
  minVolatilityPercent: number;
  emaShortPeriod: number;
  emaLongPeriod: number;
  maxAtrPercent: number;
  trendOnly: boolean;
  dynamicAtrFilter: boolean;
  confidenceValue: number;
  // category: KlineCategory;
}
