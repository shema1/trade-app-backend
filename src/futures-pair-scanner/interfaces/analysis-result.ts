import { KlineInterval } from 'src/bybit/dto/get-kline.dto';
import { MomentumEmaStrategyParamsDto } from 'src/momentum-ema-cross-strategy/dto/strategy-params.dto';
import { VolumeStrategyParamsDto } from 'src/volume-strategy/dto/volume-strategy-params';

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
  currentPrice: number;
  timestamp: number;
  signals: Signal[];
  strategyDetails?: any; // Деталі конкретної стратегії
  // telegramMessage?: TelegramMessage;
  // lostProfitInfo?: LostProfitInfo;
  // done?: boolean;
}

export interface FuturesPairStrategyParams {
  name: string;
  interval: KlineInterval;
  limit: number;
}

export interface FuturesPairStrategy {
  strategyType: StrategyType;
  params: any;
}
