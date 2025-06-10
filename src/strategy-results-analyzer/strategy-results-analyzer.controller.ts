import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StrategyResultsAnalyzerService } from './strategy-results-analyzer.service';
import { StrategyAnalysisResult } from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

@Controller('strategy-results-analyzer')
export class StrategyResultsAnalyzerController {
  constructor(
    private readonly strategyResultsAnalyzerService: StrategyResultsAnalyzerService,
  ) {}

  @Get('analyze-strategy-results/:id')
  async analyzeStrategyResults(@Param('id') id: string) {
    return this.strategyResultsAnalyzerService.analyzeStrategyResults(id);
  }

  @Post('generate-profit-lost')
  async generateProfitLost(@Body() body: { step: number; maxValue: number }) {
    return this.strategyResultsAnalyzerService.generateProfitLost(
      body.step,
      body.maxValue,
    );
  }

  @Post('check-result-on-profit-lost')
  async checkResultOnProfitLost(@Body() body: StrategyAnalysisResult) {
    return this.strategyResultsAnalyzerService.checkResultOnProfitLost(body);
  }
}
