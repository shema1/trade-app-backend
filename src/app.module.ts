import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IndicatorsModule } from './indicators/indicators.module';
import { BybitModule } from './bybit/bybit.module';
import { FuturesPairScannerModule } from './futures-pair-scanner/futures-pair-scanner.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MomentumEmaCrossStrategyModule } from './momentum-ema-cross-strategy/momentum-ema-cross-strategy.module';
import { VolumeStrategyModule } from './volume-strategy/volume-strategy.module';
import { StrategiesHandlerModule } from './strategies-handler/strategies-handler.module';
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 10000, // час життя кешу в мілісекундах
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    IndicatorsModule,
    BybitModule,
    FuturesPairScannerModule,
    MomentumEmaCrossStrategyModule,
    VolumeStrategyModule,
    StrategiesHandlerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
