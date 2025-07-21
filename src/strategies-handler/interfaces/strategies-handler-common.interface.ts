import { KlineInterval } from 'src/bybit/dto/get-kline.dto';

export enum StrategyType {
  MOMENTUM_EMA_CROSS = 'MOMENTUM_EMA_CROSS',
  VOLUME_ANALYSIS = 'VOLUME_ANALYSIS',
}

export interface Signal {
  name: string;
  value: number;
  interpretation: string;
}

export enum AnalysisResultRecommendation {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
}

export interface StrategyOrderParams {
  takeProfit: number;
  stopLoss: number;
  betSize: number;
}

export interface Strategy {
  strategyType: StrategyType;
  params: any; //MomentumEmaStrategyItem | VolumeStrategyItem
  orderParams?: StrategyOrderParams;
}

export interface GroupedStrategies {
  [key: string]: Strategy[];
}

export interface StrategyAnalysisResult {
  name: string;
  symbol: string;
  strategyType: StrategyType;
  recommendation: AnalysisResultRecommendation;
  confidence: number; // від 0 до 1
  currentPrice: number;
  timestamp: number;
  signals: Signal[];
  interval: KlineInterval;
  strategyDetails?: any; // Деталі конкретної стратегії
  orderParams?: StrategyOrderParams;
  // telegramMessage?: TelegramMessage;
  // lostProfitInfo?: LostProfitInfo;
  // done?: boolean;
}

export interface StrategyParams {
  name: string;
  interval: KlineInterval;
  limit: number;
  minConfidence: number;
}

export interface StartegyScanningIntervalParams {
  [key: string]: {
    lastSync: string;
    count: 0;
    frequencyInMinutes: number;
  };
}
