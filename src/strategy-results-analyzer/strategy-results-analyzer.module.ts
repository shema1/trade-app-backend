import { Module } from '@nestjs/common';
import { StrategyResultsAnalyzerService } from './strategy-results-analyzer.service';
import { StrategyResultsAnalyzerController } from './strategy-results-analyzer.controller';
import {
  FuturesPair,
  FuturesPairSchema,
} from 'src/futures-pair-scanner/schemas/futures-pair.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BybitModule } from 'src/bybit/bybit.module';

@Module({
  controllers: [StrategyResultsAnalyzerController],
  providers: [StrategyResultsAnalyzerService],
  imports: [
    MongooseModule.forFeature([
      { name: FuturesPair.name, schema: FuturesPairSchema },
    ]),
    BybitModule,
  ],
})
export class StrategyResultsAnalyzerModule {}
