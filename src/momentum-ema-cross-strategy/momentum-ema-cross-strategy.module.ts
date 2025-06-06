import { Module } from '@nestjs/common';
import { MomentumEmaCrossStrategyService } from './momentum-ema-cross-strategy.service';
import { MomentumEmaCrossStrategyController } from './momentum-ema-cross-strategy.controller';
import { BybitModule } from 'src/bybit/bybit.module';
import { IndicatorsModule } from 'src/indicators/indicators.module';

@Module({
  controllers: [MomentumEmaCrossStrategyController],
  providers: [MomentumEmaCrossStrategyService],
  imports: [BybitModule, IndicatorsModule],
  exports: [MomentumEmaCrossStrategyService],
})
export class MomentumEmaCrossStrategyModule {}
