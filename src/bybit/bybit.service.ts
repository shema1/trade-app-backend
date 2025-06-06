import { Inject, Injectable } from '@nestjs/common';
import { RestClientV5 } from 'bybit-api';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BybitService {
  private readonly client: RestClientV5;
  private readonly cacheManager: Cache;
  private readonly CACHE_TTL = 10; // 10 секунд для кешу

  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.cacheManager = cacheManager;
    this.client = new RestClientV5({
      key: this.configService.get<string>('BYBIT_API_KEY'),
      secret: this.configService.get<string>('BYBIT_API_SECRET'),
      testnet: false,
    });
  }
}
