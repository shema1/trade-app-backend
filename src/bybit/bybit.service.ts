import { Inject, Injectable } from '@nestjs/common';
import {
  RestClientV5,
  CategoryV5,
  OrderParamsV5,
  OrderResultV5,
  APIResponseV3WithTime,
} from 'bybit-api';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import {
  FutureOrderError,
  KlineDataItem,
  KlineDataItemBatch,
  LimitOrderParams,
} from './interfaces/responses.interface';
import { reverse } from 'lodash';
import { GetKlineDto, KlineCategory, KlineInterval } from './dto/get-kline.dto';
import { GetKlineBatchDto } from './dto/get-kline-batch.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AnalysisResultRecommendation } from 'src/strategies-handler/interfaces/strategies-handler-common.interface';
import { webcrypto } from 'crypto';

if (typeof global.crypto === 'undefined') {
  global.crypto = webcrypto as any;
}
@Injectable()
export class BybitService {
  private readonly client: RestClientV5;
  private readonly cacheManager: Cache;
  private readonly CACHE_TTL = 10; // 10 секунд для кешу
  private readonly FUTURES_SYMBOLS_CACHE_TTL = 3600; // 1 година для кешу символів

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

  async getKlineData(data: GetKlineDto): Promise<KlineDataItem[]> {
    const cacheKey = `kline:${data.symbol}:${data.interval}:${data.limit}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData as KlineDataItem[];
    }

    const response = await this.client.getKline({
      category: data.category,
      symbol: data.symbol,
      interval: data.interval,
      limit: Number(data.limit),
      start: data.start,
      end: data.end,
    });

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

  async getKlineDataBatch(
    data: GetKlineBatchDto,
  ): Promise<KlineDataItemBatch[]> {
    let symbolsToScan: string[] = [];

    if (data.symbols?.length) {
      symbolsToScan = data.symbols;
    } else {
      try {
        const futuresPairs = await this.getFuturesSymbols(data.category);
        symbolsToScan = futuresPairs || [];
      } catch (error) {
        console.error('Error getting symbols list:', error);
        return [];
      }
    }

    if (!symbolsToScan.length) {
      console.warn('No symbols to scan');
      return [];
    }
    console.log(
      'Starting batch volume analysis for symbols:',
      symbolsToScan.length,
    );

    const batchSize = 50;
    const results: KlineDataItemBatch[] = [];
    const failedSymbols: string[] = [];

    for (let i = 0; i < symbolsToScan.length; i += batchSize) {
      const batch = symbolsToScan.slice(i, i + batchSize);
      console.log(
        `Processing batch ${data.interval} ${i / batchSize + 1}/${Math.ceil(
          symbolsToScan.length / batchSize,
        )}`,
      );
      const batchPromises = batch.map(async (symbol) => {
        try {
          const klineData = await this.getKlineData({
            category: data.category,
            symbol,
            interval: data.interval,
            limit: data.limit,
          });
          return {
            symbol,
            interval: data.interval,
            limit: data.limit,
            list: klineData,
            category: data.category,
          };
        } catch (error) {
          console.error(`Error fetching kline data for ${symbol}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          failedSymbols.push(batch[index]);
        }
      });
    }

    if (failedSymbols.length) {
      console.warn('Failed to fetch kline data for symbols:', failedSymbols);
    }

    return results;
  }

  async getFuturesSymbols(category: KlineCategory): Promise<string[]> {
    try {
      const cacheKey = `futures_symbols:${category}`;
      const cachedSymbols = await this.cacheManager.get<string[]>(cacheKey);

      if (cachedSymbols) {
        return cachedSymbols;
      }

      const response = await this.client.getInstrumentsInfo({
        category: category as CategoryV5,
      });

      if (!response.result || !response.result.list) {
        console.error(
          "Не вдалося отримати список ф'ючерсних пар: відсутні дані у відповіді",
        );
        return [];
      }

      const symbols = response.result.list
        .filter((instrument) => instrument.status === 'Trading')
        .map((instrument) => instrument.symbol);

      await this.cacheManager.set(
        cacheKey,
        symbols,
        this.FUTURES_SYMBOLS_CACHE_TTL,
      );

      return symbols;
    } catch (error) {
      console.error("Помилка при отриманні списку ф'ючерсних пар:", error);
      return [];
    }
  }

  async test() {
    const a = [
      '1',
      '3',
      // '5',
      // '15',
      // '30',
      // '60',
      // '120',
      // '240',
      // '360',
      // '720',
      // 'D',
      // 'W',
      // 'M',
    ];

    const symbols = await this.getFuturesSymbols(KlineCategory.LINEAR);

    const b = [];
    for (const interval of a) {
      console.log('interval', interval);
      const data = await this.getKlineDataBatch({
        symbols,
        interval: interval as KlineInterval,
        limit: 1000,
        category: KlineCategory.LINEAR,
      });

      b.push(data);

      console.log('result', data.length);
    }

    return b;
    // const data = await this.getKlineDataBatch({
    //   symbols: ['BTCUSDT', 'ETHUSDT'],
    //   interval: '15',
    //   limit: 100,
    // });
  }

  async openLimitOrder(
    data: LimitOrderParams,
  ): Promise<APIResponseV3WithTime<OrderResultV5> | FutureOrderError> {
    try {
      const orderLinkId = `limit-${data.symbol}-${Date.now()}`;

      return await this.client.submitOrder({
        orderLinkId,
        category: 'linear', // 'linear' для USDT perpetual
        symbol: data.symbol,
        side: data.side, // або 'Sell'
        orderType: 'Limit',
        qty: data.qty, // кількість
        price: data.price, // ціна покупки
        timeInForce: 'GTC', // Good Till Cancelled
        takeProfit: data.takeProfit,
        stopLoss: data.stopLoss,
        positionIdx: data.side === 'Buy' ? 1 : 2,
        reduceOnly: false, // чи закриває частину/всю позицію
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        testError: 'testError',
        error: error,
      };
    }
  }

  async openFutureOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<APIResponseV3WithTime<OrderResultV5> | FutureOrderError> {
    try {
      const orderLinkId = `${createOrderDto.symbol}-${Date.now()}`;

      console.log('woork2');
      const side =
        createOrderDto.side === AnalysisResultRecommendation.BUY
          ? 'Buy'
          : 'Sell';

      const targetPrices =
        side === 'Buy'
          ? {
              profit:
                createOrderDto.price * (1 + createOrderDto.takeProfit / 100),
              loss: createOrderDto.price * (1 - createOrderDto.stopLoss / 100),
            }
          : {
              profit:
                createOrderDto.price * (1 - createOrderDto.takeProfit / 100),
              loss: createOrderDto.price * (1 + createOrderDto.stopLoss / 100),
            };

      const qty = Number(
        (
          Math.round(
            (createOrderDto.betSize / Number(createOrderDto.price)) * 100000,
          ) / 100000
        ).toFixed(0),
      );

      const data: OrderParamsV5 = {
        category: 'linear',
        orderType: 'Market',
        side,
        symbol: createOrderDto.symbol,
        qty: qty.toString(),
        orderLinkId,
        takeProfit: targetPrices.profit.toString(),
        stopLoss: targetPrices.loss.toString(),
        positionIdx: side === 'Buy' ? 1 : 2,
      };

      // if (createOrderDto.price) {
      //   data.price = createOrderDto.price.toString();
      // }

      const response = await this.client.submitOrder(data);

      console.log('response', response);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        testError: 'testError',
        error: error,
      };
    }
  }
}
