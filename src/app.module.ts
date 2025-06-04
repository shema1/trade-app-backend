import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IndicatorsModule } from './indicators/indicators.module';

@Module({
  imports: [IndicatorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
