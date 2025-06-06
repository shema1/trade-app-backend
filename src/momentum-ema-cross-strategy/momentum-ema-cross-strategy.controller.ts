import { Body, Controller, Post } from '@nestjs/common';
import { MomentumEmaStrategyParamsDto } from './dto/strategy-params.dto';
import { MomentumEmaCrossStrategyService } from './momentum-ema-cross-strategy.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('momentum-ema-cross-strategy')
export class MomentumEmaCrossStrategyController {
  constructor(
    private readonly momentumEmaCrossStrategyService: MomentumEmaCrossStrategyService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Аналіз торгової пари за стратегією Momentum EMA Cross',
    description: `
Аналізує торгову пару за стратегією Momentum EMA Cross, яка поєднує в собі кілька технічних індикаторів для визначення торгових сигналів.

Вхідні параметри:

1. symbol (символ торгової пари):
   - Тип: рядок
   - Обов'язковий параметр
   - Вплив на результат:
     * Визначає торгову пару для аналізу
     * Використовується для отримання історичних даних
   - Приклад: 'BTCUSDT'

2. interval (інтервал часу):
   - Тип: KlineInterval
   - Обов'язковий параметр
   - Вплив на результат:
     * Визначає часовий проміжок для аналізу
     * Впливає на чутливість стратегії
   - Приклад: '60' (хвилинні свічки)

3. kline (масив свічок):
   - Тип: масив KlineDataItem
   - Опціональний параметр
   - Вплив на результат:
     * Якщо надано, використовуються ці дані
     * Якщо не надано, дані отримуються з Bybit API
   - Приклад: []

4. limit (кількість свічок):
   - Тип: число
   - За замовчуванням: 200
   - Вплив на результат:
     * Більше значень = точніші розрахунки
     * Менше значень = швидший аналіз
   - Приклад: 200

5. minPriceChangePercent (мінімальна зміна ціни):
   - Тип: число
   - За замовчуванням: 0.7
   - Вплив на результат:
     * Менше значення = більше сигналів
     * Більше значення = менше, але надійніші сигнали
   - Приклад: 0.7

6. minAdxStrength (мінімальна сила тренду):
   - Тип: число
   - За замовчуванням: 25
   - Вплив на результат:
     * Визначає мінімальну силу тренду для сигналу
     * Менше значення = більше сигналів
     * Більше значення = тільки сильні тренди
   - Приклад: 25

7. minVolatilityPercent (мінімальна волатильність):
   - Тип: число
   - За замовчуванням: 0.7
   - Вплив на результат:
     * Визначає мінімальну волатильність для сигналу
     * Менше значення = більше сигналів
     * Більше значення = тільки волатильні рухи
   - Приклад: 0.7

8. emaShortPeriod (період короткої EMA):
   - Тип: число
   - За замовчуванням: 9
   - Вплив на результат:
     * Менше значення = швидші сигнали
     * Більше значення = більш плавні сигнали
   - Приклад: 9

9. emaLongPeriod (період довгої EMA):
   - Тип: число
   - За замовчуванням: 21
   - Вплив на результат:
     * Менше значення = швидші сигнали
     * Більше значення = більш плавні сигнали
   - Приклад: 21

10. maxAtrPercent (максимальна волатильність):
    - Тип: число
    - За замовчуванням: 5
    - Вплив на результат:
      * Визначає максимальну допустиму волатильність
      * Менше значення = менше сигналів в періоди високої волатильності
      * Більше значення = більше сигналів
    - Приклад: 5

11. trendOnly (тільки трендові сигнали):
    - Тип: булеве значення
    - За замовчуванням: true
    - Вплив на результат:
      * true = сигнали тільки в трендовому ринку
      * false = сигнали в будь-якому ринку
    - Приклад: true

12. dynamicAtrFilter (динамічний фільтр ATR):
    - Тип: булеве значення
    - За замовчуванням: true
    - Вплив на результат:
      * true = адаптивна волатильність
      * false = фіксована волатильність
    - Приклад: true

Результат аналізу:
- symbol: символ торгової пари
- strategyType: тип стратегії (MOMENTUM_EMA_CROSS)
- recommendation: рекомендація (BUY/SELL/HOLD)
- confidence: рівень впевненості (0-1)
- signalConfidence: додаткова впевненість сигналу
- currentPrice: поточна ціна
- signals: масив сигналів з індикаторів
- timestamp: час аналізу
- strategyDetails: деталі стратегії

Приклад запиту:
\`\`\`json
{
  "symbol": "BTCUSDT",
  "interval": "60",
  "minPriceChangePercent": 0.7,
  "minAdxStrength": 25,
  "minVolatilityPercent": 0.7,
  "emaShortPeriod": 9,
  "emaLongPeriod": 21,
  "maxAtrPercent": 5,
  "trendOnly": true,
  "dynamicAtrFilter": true
}
\`\`\`

Приклад відповіді:
\`\`\`json
{
  "symbol": "BTCUSDT",
  "strategyType": "MOMENTUM_EMA_CROSS",
  "recommendation": "BUY",
  "confidence": 0.85,
  "signalConfidence": 0,
  "currentPrice": 50000,
  "signals": [
    {
      "name": "EMA Cross",
      "value": 150,
      "interpretation": "Golden Cross (EMA9 перетнула EMA21 знизу вгору)"
    },
    {
      "name": "Price Momentum",
      "value": 1.2,
      "interpretation": "Зміна ціни: 1.20%"
    },
    {
      "name": "Volatility (ATR)",
      "value": 1.5,
      "interpretation": "ATR: 1.50% (достатня волатильність)"
    },
    {
      "name": "Trend Strength (ADX)",
      "value": 30,
      "interpretation": "ADX: 30.00 (є тренд)"
    }
  ],
  "timestamp": 1647123456789,
  "strategyDetails": {
    "symbol": "BTCUSDT",
    "interval": "60",
    "minPriceChangePercent": 0.7,
    "minAdxStrength": 25,
    "minVolatilityPercent": 0.7,
    "emaShortPeriod": 9,
    "emaLongPeriod": 21,
    "maxAtrPercent": 5,
    "trendOnly": true,
    "dynamicAtrFilter": true
  }
}
\`\`\`

Помилки:
- 400: Недостатня кількість даних
- 400: Невірний формат даних
- 400: Некоректні значення параметрів
- 500: Помилка розрахунку
`,
  })
  async analyze(@Body() params: MomentumEmaStrategyParamsDto) {
    return this.momentumEmaCrossStrategyService.momentumEmaCrossStrategy(
      params,
    );
  }
}
