import { Module } from '@nestjs/common';
import { BybitController } from './bybit.controller';
import { BybitService } from './bybit.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({
  imports: [CacheModule.register(), ConfigModule],
  controllers: [BybitController],
  providers: [
    BybitService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
  exports: [BybitService],
})
export class BybitModule {}
