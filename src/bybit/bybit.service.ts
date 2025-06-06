import { Inject, Injectable } from '@nestjs/common';
import { GetKlineParamsV5, RestClientV5 } from 'bybit-api';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { KlineDataItem } from './interfaces/responses.interface';
import { reverse } from 'lodash';

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

  async getKlineData(data: GetKlineParamsV5): Promise<KlineDataItem[]> {
    const cacheKey = `kline:${data.symbol}:${data.interval}:${data.limit}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData as KlineDataItem[];
    }

    const response = await this.client.getKline(data);

    const formattedData = response.result.list.map((item) => ({
      timestamp: parseInt(item[0]),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));

    await this.cacheManager.set(cacheKey, formattedData, this.CACHE_TTL);

    return reverse(formattedData) as KlineDataItem[];
  }
}
