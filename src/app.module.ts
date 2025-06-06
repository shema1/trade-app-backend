import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IndicatorsModule } from './indicators/indicators.module';
import { BybitModule } from './bybit/bybit.module';
import { FuturesPairScannerModule } from './futures-pair-scanner/futures-pair-scanner.module';

@Module({
  imports: [IndicatorsModule, BybitModule, FuturesPairScannerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
