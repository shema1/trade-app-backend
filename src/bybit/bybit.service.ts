import { Inject, Injectable } from '@nestjs/common';
import { GetKlineParamsV5, RestClientV5 } from 'bybit-api';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { KlineDataItem } from './interfaces/responses.interface';

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

  async getKlineData(data: GetKlineParamsV5): Promise<any> {
    const cacheKey = `kline:${data.symbol}:${data.interval}:${data.limit}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData as KlineDataItem[];
    }

    return await this.client.getKline(data);
  }
}
