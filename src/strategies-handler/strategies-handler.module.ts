import { Module } from '@nestjs/common';
import { StrategiesHandlerService } from './strategies-handler.service';
import { StrategiesHandlerController } from './strategies-handler.controller';
import { BybitModule } from 'src/bybit/bybit.module';
import { VolumeStrategyModule } from 'src/volume-strategy/volume-strategy.module';
import { MomentumEmaCrossStrategyModule } from 'src/momentum-ema-cross-strategy/momentum-ema-cross-strategy.module';

@Module({
  controllers: [StrategiesHandlerController],
  providers: [StrategiesHandlerService],
  exports: [StrategiesHandlerService],
  imports: [BybitModule, MomentumEmaCrossStrategyModule, VolumeStrategyModule],
})
export class StrategiesHandlerModule {}
