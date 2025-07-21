import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { BybitService } from './bybit.service';
import { GetKlineDto } from './dto/get-kline.dto';
import { GetKlineBatchDto } from './dto/get-kline-batch.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Bybit')
@Controller('bybit')
export class BybitController {
  constructor(private readonly bybitService: BybitService) {}

  @Get('kline')
  @ApiOperation({ summary: 'Отримати дані клін з Bybit' })
  @ApiResponse({ status: 200, description: 'Успішно отримано дані клін' })
  @ApiResponse({ status: 400, description: 'Невірні параметри запиту' })
  @ApiResponse({ status: 500, description: 'Внутрішня помилка сервера' })
  async getKlineData(@Query() query: GetKlineDto) {
    return await this.bybitService.getKlineData(query);
  }

  @Get('kline-batch')
  @ApiOperation({ summary: 'Отримати дані клін з Bybit' })
  @ApiResponse({ status: 200, description: 'Успішно отримано дані клін' })
  @ApiResponse({ status: 400, description: 'Невірні параметри запиту' })
  @ApiResponse({ status: 500, description: 'Внутрішня помилка сервера' })
  async getKlineDataBatch(@Query() query: GetKlineBatchDto) {
    return await this.bybitService.getKlineDataBatch(query);
  }

  @Post('create-order')
  @ApiOperation({
    summary: "Створити ф'ючерсний ордер на Bybit",
    description: `
    Створює ф'ючерсний ордер з автоматичним розрахунком take profit та stop loss.
    
    **Особливості:**
    - Автоматичний розрахунок кількості (qty) на основі розміру ставки та ціни
    - Автоматичне встановлення take profit та stop loss у відсотках
    - Підтримка як Buy, так і Sell ордерів
    - Використання Market ордерів для миттєвого виконання
    
    **Розрахунок кількості:**
    qty = (betSize / price) * 100000, округлено до 0 знаків після коми
    
    **Розрахунок ціни take profit:**
    - Для Buy: price * (1 + takeProfit / 100)
    - Для Sell: price * (1 - takeProfit / 100)
    
    **Розрахунок ціни stop loss:**
    - Для Buy: price * (1 - stopLoss / 100)
    - Для Sell: price * (1 + stopLoss / 100)
    `,
  })
  @ApiBody({
    type: CreateOrderDto,
    description: "Параметри для створення ф'ючерсного ордера",
    examples: {
      buyOrder: {
        summary: 'Приклад Buy ордера',
        description: 'Створення Buy ордера для BTCUSDT',
        value: {
          symbol: 'BTCUSDT',
          side: 'BUY',
          betSize: 100,
          takeProfit: 2.5,
          stopLoss: 1.0,
          price: 45000,
          leverage: 10,
        },
      },
      sellOrder: {
        summary: 'Приклад Sell ордера',
        description: 'Створення Sell ордера для ETHUSDT',
        value: {
          symbol: 'ETHUSDT',
          side: 'SELL',
          betSize: 50,
          takeProfit: 1.8,
          stopLoss: 0.8,
          price: 2800,
          leverage: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ордер успішно створено',
    schema: {
      type: 'object',
      properties: {
        retCode: {
          type: 'number',
          description: 'Код відповіді API',
          example: 0,
        },
        retMsg: {
          type: 'string',
          description: 'Повідомлення відповіді',
          example: 'OK',
        },
        result: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'Унікальний ідентифікатор ордера',
              example: '1234567890abcdef',
            },
            orderLinkId: {
              type: 'string',
              description: 'Зовнішній ідентифікатор ордера',
              example: 'BTCUSDT-1703123456789',
            },
            symbol: {
              type: 'string',
              description: 'Торгова пара',
              example: 'BTCUSDT',
            },
            side: {
              type: 'string',
              description: 'Сторона ордера (Buy/Sell)',
              example: 'Buy',
            },
            orderType: {
              type: 'string',
              description: 'Тип ордера',
              example: 'Market',
            },
            qty: {
              type: 'string',
              description: 'Кількість',
              example: '2',
            },
            takeProfit: {
              type: 'string',
              description: 'Ціна take profit',
              example: '46125.00',
            },
            stopLoss: {
              type: 'string',
              description: 'Ціна stop loss',
              example: '44550.00',
            },
            positionIdx: {
              type: 'number',
              description: 'Індекс позиції (1 для Buy, 2 для Sell)',
              example: 1,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Невірні параметри запиту',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: [
            'symbol should not be empty',
            'betSize must be a positive number',
          ],
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизований доступ - невірний API ключ',
    schema: {
      type: 'object',
      properties: {
        retCode: {
          type: 'number',
          example: 10001,
        },
        retMsg: {
          type: 'string',
          example: 'Invalid API key',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Недостатньо коштів або перевищено ліміти',
    schema: {
      type: 'object',
      properties: {
        retCode: {
          type: 'number',
          example: 10004,
        },
        retMsg: {
          type: 'string',
          example: 'Insufficient balance',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Внутрішня помилка сервера або помилка Bybit API',
    schema: {
      type: 'object',
      properties: {
        testError: {
          type: 'string',
          example: 'testError',
        },
        error: {
          type: 'object',
          description: 'Деталі помилки',
        },
      },
    },
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.bybitService.openFutureOrder(createOrderDto);
  }

  @Get('test')
  async test() {
    return await this.bybitService.test();
  }
}
