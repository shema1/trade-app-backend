import { KlineDataItem } from 'src/bybit/interfaces/responses.interface';
import {
  AnalysisResultRecommendation,
  StrategyAnalysisResult,
  StrategyType,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

export enum TradeResult {
  PROFIT = 'PROFIT',
  LOSS = 'LOSS',
  ACTIVE = 'ACTIVE',
}

export interface TradeLevel {
  label: string;
  takeProfit: number;
  stopLoss: number;
}

export interface TradeTarget {
  profitPrice: number;
  lossPrice: number;
  takeProfitPercent: number;
  stopLossPercent: number;
  label: string;
  entryTimestamp: number;
  side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>;
}

export interface TradeTargetRequest extends TradeLevel {
  side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>;
  entryPrice: number;
  entryTimestamp: number;
}

export interface TradeAnalysisResult {
  result: TradeResult;
  targetReachedAt: number;
  minutesToTarget: number;
}

export interface TradeAnalysisWithTarget
  extends TradeAnalysisResult,
    TradeTarget {
  symbol: string;
}

export interface TradeAnalysisBatch {
  tradeLevels: TradeLevel[];
  strategyResult: StrategyAnalysisResult;
}

export interface TradeAnalysisRequest {
  side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>;
  klineData: KlineDataItem[];
  targetPrices: { profitPrice: number; lossPrice: number };
}

export interface StrategyAnalysisResponse {
  strategy: StrategyAnalysisResult;
  tradeAnalysis: TradeAnalysisWithTarget[];
}

export interface StrategyStats {
  total: number;
  profit: number;
  loss: number;
  active: number;
  successRate: number;
}

export interface TradeLevelStats {
  takeProfitPercent: number;
  stopLossPercent: number;
  stats: StrategyStats;
}

export interface StrategyNameStats {
  name: string;
  stats: StrategyStats;
  bestTradeLevel: TradeLevelStats;
  tradeLevels: TradeLevelStats[];
}

export interface StrategyTypeStats {
  type: StrategyType;
  strategies: StrategyNameStats[];
  stats: StrategyStats;
}

export interface StrategyAnalysisSummary {
  byType: StrategyTypeStats[];
  totalStats: StrategyStats;
}

export interface GroupedResultsByType {
  [strategyType: string]: {
    [interval: string]: {
      [strategyName: string]: StrategyAnalysisResponse[];
    };
  };
}

export interface TradeStats {
  profit: number;
  loss: number;
  active: number;
  successRate: number;
  balance?: number;
}

export interface StrategyResults {
  [interval: string]: {
    [strategyType: string]: {
      [strategyName: string]: {
        [label: string]: TradeStats;
      };
    };
  };
}

export interface TradeStatsAccumulator {
  [label: string]: TradeStats;
}
