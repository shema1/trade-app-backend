import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { MomentumEmaStrategyParamsDto } from 'src/momentum-ema-cross-strategy/dto/strategy-params.dto';
import { MomentumEmaStrategyItem } from 'src/momentum-ema-cross-strategy/interfaces/momentum-ema-srategy';
import { VolumeStrategyParamsDto } from 'src/volume-strategy/dto/volume-strategy-params';
import { VolumeStrategyItem } from 'src/volume-strategy/interfaces/volume-srategy';

export enum AnalysisResultRecommendation {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
}

export interface Signal {
  name: string;
  value: number;
  interpretation: string;
}

export enum StrategyType {
  MOMENTUM_EMA_CROSS = 'MOMENTUM_EMA_CROSS',
  VOLUME_ANALYSIS = 'VOLUME_ANALYSIS',
}

export interface AnalysisResult {
  symbol: string;
  strategyType: StrategyType;
  recommendation: AnalysisResultRecommendation;
  confidence: number; // від 0 до 1
  signalConfidence: number; // від 0 до 100
  currentPrice: number;
  timestamp: number;
  signals: Signal[];
  strategyDetails?: MomentumEmaStrategyParamsDto | VolumeStrategyParamsDto; // Деталі конкретної стратегії
  // telegramMessage?: TelegramMessage;
  // lostProfitInfo?: LostProfitInfo;
  // done?: boolean;
}

export interface FuturesPairStrategyParams {
  interval: KlineInterval;
  limit: number;
}
export interface FuturesPairStrategy {
  strategyType: StrategyType;
  params: MomentumEmaStrategyItem | VolumeStrategyItem;
}
