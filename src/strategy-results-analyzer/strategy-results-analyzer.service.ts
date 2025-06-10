import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { reduce } from 'lodash';
import { Model } from 'mongoose';
import { FuturesPair } from 'src/futures-pair-scanner/schemas/futures-pair.schema';
import {
  AnalysisResultRecommendation,
  StrategyAnalysisResult,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';
import {
  CalculateTargetPricesRequest,
  CalculateTargetPricesResponse,
  ProfitLost,
  ProfitLostResult,
  Result,
  StrategyGroupedResults,
  TargetPricesRequest,
} from './interfaces/strategy-results-analyzer.interface';
import { BybitService } from 'src/bybit/bybit.service';
import { KlineCategory } from 'src/bybit/dto/get-kline.dto';
import { KlineDataItem } from 'src/bybit/interfaces/responses.interface';

@Injectable()
export class StrategyResultsAnalyzerService {
  constructor(
    @InjectModel(FuturesPair.name)
    private readonly futuresPairModel: Model<FuturesPair>,
    private readonly bybitService: BybitService,
  ) {}

  async analyzeStrategyResults(id: string) {
    const futuresPair = await this.futuresPairModel.findById(id);
    if (!futuresPair) {
      throw new NotFoundException('Futures pair not found');
    }

    console.log('futuresPair.results.length', futuresPair.results.length);

    if (futuresPair.results.length === 0) {
      return [];
    }

    const results = await Promise.all(
      futuresPair.results.map((strategy) =>
        this.checkResultOnProfitLost(strategy),
      ),
    );

    const newRes = this.getResult(results);
    return newRes;
  }

  private getResult(
    results: {
      strategy: StrategyAnalysisResult;
      results: (CalculateTargetPricesResponse & { result: ProfitLostResult })[];
    }[],
  ): Result {
    const result: Result = {};

    results.forEach(({ strategy, results: profitLostResults }) => {
      const { strategyType, name, interval } = strategy;

      if (!result[strategyType]) {
        result[strategyType] = {};
      }
      if (!result[strategyType][interval]) {
        result[strategyType][interval] = {};
      }
      if (!result[strategyType][interval][name]) {
        result[strategyType][interval][name] = {};
      }

      profitLostResults.forEach((profitLostResult) => {
        const { labelString, result: profitLostResultType } = profitLostResult;

        if (!result[strategyType][interval][name][labelString]) {
          result[strategyType][interval][name][labelString] = {
            profit: 0,
            loss: 0,
            active: 0,
          };
        }

        switch (profitLostResultType) {
          case ProfitLostResult.PROFIT:
            result[strategyType][interval][name][labelString].profit++;
            break;
          case ProfitLostResult.LOSS:
            result[strategyType][interval][name][labelString].loss++;
            break;
          case ProfitLostResult.ACTIVE:
            result[strategyType][interval][name][labelString].active++;
            break;
        }
      });
    });

    return result;
  }

  getGroupedStrategy(
    results: StrategyAnalysisResult[],
  ): StrategyGroupedResults {
    return reduce(
      results,
      (acc, result) => {
        const { strategyType, name, interval } = result;

        // Ініціалізуємо структуру, якщо її ще немає
        if (!acc[strategyType]) {
          acc[strategyType] = {};
        }
        if (!acc[strategyType][interval]) {
          acc[strategyType][interval] = {};
        }
        if (!acc[strategyType][interval][name]) {
          acc[strategyType][interval][name] = [];
        }

        // Додаємо результат до відповідного масиву
        acc[strategyType][interval][name].push(result);
        return acc;
      },
      {} as StrategyGroupedResults,
    );
  }

  generateProfitLost(step: number, maxValue: number): ProfitLost[] {
    const result: ProfitLost[] = [];

    // Генеруємо всі можливі комбінації profit/lost
    for (let profit = step; profit <= maxValue; profit += step) {
      for (let lost = step; lost <= maxValue; lost += step) {
        result.push({
          labelString: `${profit}/-${lost}`,
          takeProfit: profit,
          stopLoss: lost,
        });
      }
    }

    return result;
  }

  async analyzeStrategyResult(strategyResult: StrategyAnalysisResult[]) {
    const results = await Promise.all(
      strategyResult.map((strategy) => this.checkResultOnProfitLost(strategy)),
    );
    return results;
  }

  async checkResultOnProfitLost(
    strategyResult: StrategyAnalysisResult,
  ): Promise<{
    strategy: StrategyAnalysisResult;
    results: (CalculateTargetPricesResponse & { result: ProfitLostResult })[];
  }> {
    const klineData = await this.bybitService.getKlineData({
      symbol: strategyResult.symbol,
      interval: '1',
      category: KlineCategory.LINEAR,
      limit: 1000,
      start: strategyResult.timestamp,
    });

    const profitLostValues = this.generateProfitLost(0.5, 5);

    const profitLostResults = this.getTargetPrices({
      profitLostValues,
      strategyResult,
    });

    const profitLostResultsWithKlineData =
      this.analyzeKlineDataForEachProfitLost({
        profitLostResults,
        klineData,
      });

    return {
      strategy: strategyResult,
      results: profitLostResultsWithKlineData,
    };
  }

  private analyzeKlineDataForEachProfitLost({
    profitLostResults,
    klineData,
  }: {
    profitLostResults: CalculateTargetPricesResponse[];
    klineData: KlineDataItem[];
  }) {
    const profitLostResultsWithKlineData = profitLostResults.map(
      (profitLostResult) => ({
        result: this.analyzeKlineData(profitLostResult.side, klineData, {
          profitPrice: profitLostResult.profitPrice,
          lossPrice: profitLostResult.lossPrice,
        }),
        ...profitLostResult,
      }),
    );

    return profitLostResultsWithKlineData;
  }

  private analyzeKlineData(
    side: Omit<AnalysisResultRecommendation, AnalysisResultRecommendation.HOLD>,
    klineData: KlineDataItem[],
    targetPrices: { profitPrice: number; lossPrice: number },
  ): ProfitLostResult {
    for (let i = 1; i < klineData.length; i++) {
      const candle = klineData[i];

      if (side === AnalysisResultRecommendation.BUY) {
        if (candle.high >= targetPrices.profitPrice)
          return ProfitLostResult.PROFIT;
        if (candle.low <= targetPrices.lossPrice) return ProfitLostResult.LOSS;
      } else {
        if (candle.low <= targetPrices.profitPrice)
          return ProfitLostResult.PROFIT;
        if (candle.high >= targetPrices.lossPrice) return ProfitLostResult.LOSS;
      }
    }

    return ProfitLostResult.ACTIVE;
  }

  private calculateTargetPrices(
    data: CalculateTargetPricesRequest,
  ): CalculateTargetPricesResponse {
    const { side, entryPrice, takeProfit, stopLoss } = data;
    return side === AnalysisResultRecommendation.BUY
      ? {
          profitPrice: entryPrice * (1 + takeProfit / 100),
          lossPrice: entryPrice * (1 - stopLoss / 100),
          labelString: data.labelString,
          side: side,
          takeProfitPercent: takeProfit,
          stopLossPercent: stopLoss,
        }
      : {
          profitPrice: entryPrice * (1 - takeProfit / 100),
          lossPrice: entryPrice * (1 + stopLoss / 100),
          labelString: data.labelString,
          side: side,
          takeProfitPercent: takeProfit,
          stopLossPercent: stopLoss,
        };
  }

  private getTargetPrices(
    data: TargetPricesRequest,
  ): CalculateTargetPricesResponse[] {
    const profitLostResults = data.profitLostValues.map((profitLostValue) =>
      //розраховуємо цільові ціни для конкретної комбінації profit/lost
      this.calculateTargetPrices({
        labelString: profitLostValue.labelString,
        takeProfit: profitLostValue.takeProfit,
        stopLoss: profitLostValue.stopLoss,
        side: data.strategyResult.recommendation,
        entryPrice: data.strategyResult.currentPrice,
      }),
    );
    return profitLostResults;
  }
}
