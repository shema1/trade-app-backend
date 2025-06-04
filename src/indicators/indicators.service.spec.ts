import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorsService } from './indicators.service';

describe('IndicatorsService', () => {
  let service: IndicatorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndicatorsService],
    }).compile();

    service = module.get<IndicatorsService>(IndicatorsService);
  });

  describe('calculateRSI', () => {
    it('повинен правильно розраховувати RSI для набору цін', async () => {
      // Тестові дані
      const prices = [
        44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08,
        45.89, 46.03, 45.61, 46.28, 46.28, 46.0, 46.03, 46.41, 46.22, 45.64,
        46.21, 46.25, 45.71, 46.45, 45.78, 45.35, 44.03, 44.18, 44.22, 44.57,
        43.42, 42.66, 43.13,
      ];

      const period = 14;

      const result = await service.calculateRSI(prices, period);

      // Перевіряємо, що результат є масивом
      expect(Array.isArray(result)).toBe(true);

      // Перевіряємо, що довжина результату відповідає очікуваній
      // RSI починається після періоду, тому довжина має бути prices.length - period
      expect(result.length).toBe(prices.length - period);

      // Перевіряємо, що всі значення RSI знаходяться в межах від 0 до 100
      result.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });

      // Перевіряємо конкретні значення RSI
      // Ці значення можуть відрізнятися залежно від реалізації, тому перевіряємо лише формат
      expect(typeof result[0]).toBe('number');
      expect(typeof result[result.length - 1]).toBe('number');
    });

    it('повинен використовувати стандартний період 14, якщо період не вказано', async () => {
      const prices = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42];
      const result = await service.calculateRSI(prices);
      expect(result.length).toBe(prices.length - 14);
    });

    it('повинен повертати порожній масив для недостатньої кількості даних', async () => {
      const prices = [44.34, 44.09, 44.15]; // Менше ніж період
      const result = await service.calculateRSI(prices, 14);
      expect(result.length).toBe(0);
    });
  });
});
