import {
  AnalysisResultRecommendation,
  StrategyAnalysisResult,
  StrategyType,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

export enum ProfitLostResult {
  PROFIT = 'PROFIT',
  LOSS = 'LOSS',
  ACTIVE = 'ACTIVE',
}

export type StrategyGroupedResults = {
  [strategyType: string]: {
    [interval: string]: {
      [strategyName: string]: StrategyAnalysisResult[];
    };
  };
};

export interface Resu {
  strategy: StrategyAnalysisResult;
  profit: boolean;
}

export interface ProfitLost {
  labelString: string;
  takeProfit: number;
  stopLoss: number;
}

export interface CalculateTargetPricesRequest extends ProfitLost {
  side: Omit<AnalysisResultRecommendation, 'HOLD'>;
  entryPrice: number;
}

export interface CalculateTargetPricesResponse {
  profitPrice: number;
  lossPrice: number;
  takeProfitPercent: number;
  stopLossPercent: number;
  labelString: string;
  side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>;
}

export type AnalysisResultWithKlineData = {
  result: ProfitLostResult;
  profitPrice: number;
  lossPrice: number;
  labelString: string;
  side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>;
  takeProfitPercent: number;
  stopLossPercent: number;
  strategy: StrategyAnalysisResult;
};

export interface TargetPricesRequest {
  profitLostValues: ProfitLost[];
  strategyResult: StrategyAnalysisResult;
}

export interface Result {
  [strategyType: string]: {
    [interval: string]: {
      [strategyName: string]: {
        [profitLostLabel: string]: {
          profit: number;
          loss: number;
          active: number;
        };
      };
    };
  };
}
