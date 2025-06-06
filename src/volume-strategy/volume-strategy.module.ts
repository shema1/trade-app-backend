import { Module } from '@nestjs/common';
import { VolumeStrategyService } from './volume-strategy.service';
import { VolumeStrategyController } from './volume-strategy.controller';
import { BybitModule } from 'src/bybit/bybit.module';
import { IndicatorsModule } from 'src/indicators/indicators.module';

@Module({
  controllers: [VolumeStrategyController],
  providers: [VolumeStrategyService],
  imports: [BybitModule, IndicatorsModule],
  exports: [VolumeStrategyService],
})
export class VolumeStrategyModule {}
