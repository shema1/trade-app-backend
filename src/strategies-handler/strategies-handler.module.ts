import { Module } from '@nestjs/common';
import { StrategiesHandlerService } from './strategies-handler.service';
import { StrategiesHandlerController } from './strategies-handler.controller';

@Module({
  controllers: [StrategiesHandlerController],
  providers: [StrategiesHandlerService],
  exports: [StrategiesHandlerService],
})
export class StrategiesHandlerModule {}
