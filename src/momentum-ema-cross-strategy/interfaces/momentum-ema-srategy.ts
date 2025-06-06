import { KlineInterval } from 'src/bybit/dto/get-kline.dto';

export interface MomentumEmaStrategyItem {
  interval: KlineInterval;
  minAdxStrength: number;
  minPriceChangePercent: number;
  minVolatilityPercent: number;
  emaShortPeriod: number;
  emaLongPeriod: number;
  maxAtrPercent: number;
  trendOnly: boolean;
  dynamicAtrFilter: boolean;
  limit: number;
}
