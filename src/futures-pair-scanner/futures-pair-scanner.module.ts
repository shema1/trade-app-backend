import { Module } from '@nestjs/common';
import { FuturesPairScannerService } from './futures-pair-scanner.service';
import { FuturesPairScannerController } from './futures-pair-scanner.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FuturesPair, FuturesPairSchema } from './schemas/futures-pair.schema';
import { BybitModule } from 'src/bybit/bybit.module';
import { VolumeStrategyModule } from 'src/volume-strategy/volume-strategy.module';
import { MomentumEmaCrossStrategyModule } from 'src/momentum-ema-cross-strategy/momentum-ema-cross-strategy.module';

@Module({
  controllers: [FuturesPairScannerController],
  providers: [FuturesPairScannerService],
  imports: [
    MongooseModule.forFeature([
      { name: FuturesPair.name, schema: FuturesPairSchema },
    ]),
    BybitModule,
    MomentumEmaCrossStrategyModule,
    VolumeStrategyModule,
  ],
})
export class FuturesPairScannerModule {}
