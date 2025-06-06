import { MomentumEmaStrategyParamsDto } from 'src/momentum-ema-cross-strategy/dto/strategy-params.dto';

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
  strategyDetails?: MomentumEmaStrategyParamsDto; // Деталі конкретної стратегії
  // telegramMessage?: TelegramMessage;
  // lostProfitInfo?: LostProfitInfo;
  // done?: boolean;
}
