# Документація по скануванню з інтервалами

## Огляд

Система сканування тепер підтримує контроль частоти виконання аналізу для кожного таймфрейму окремо через параметри `startegyScanningIntervalParams`.

## Структура параметрів

```typescript
interface StartegyScanningIntervalParams {
  [KlineInterval]: {
    lastSync: string;           // ISO string останнього сканування
    count: number;              // Кількість виконаних сканувань
    frequencyInMinutes: number; // Частота сканування в хвилинах
  };
}
```

## За замовчуванням частоти сканування

| Таймфрейм | Частота (хвилини) | Опис |
|-----------|-------------------|------|
| 1m | 1 | Кожну хвилину |
| 5m | 1 | Кожну хвилину |
| 15m | 2 | Кожні 2 хвилини |
| 30m | 5 | Кожні 5 хвилин |
| 1h | 10 | Кожні 10 хвилин |
| 4h | 30 | Кожні 30 хвилин |
| 1d | 60 | Кожну годину |
| 1w | 60 | Кожну годину |
| 1M | 60 | Кожну годину |

## Нові методи

### 1. `shouldScanInterval()`
Перевіряє чи потрібно виконувати сканування для конкретного інтервалу.

```typescript
private shouldScanInterval(
  interval: KlineInterval,
  intervalParams: StartegyScanningIntervalParams,
  currentTime: Date,
): boolean
```

### 2. `updateLastScanTime()`
Оновлює час останнього сканування та лічильник для інтервалу.

```typescript
private async updateLastScanTime(
  taskId: string,
  interval: KlineInterval,
  scanTime: Date,
): Promise<void>
```

### 3. `initializeScanningParams()`
Ініціалізує параметри сканування для всіх інтервалів.

```typescript
private async initializeScanningParams(taskId: string): Promise<void>
```

### 4. `getScanningStats()`
Отримує статистику сканування для конкретного taskId.

```typescript
async getScanningStats(taskId: string): Promise<any>
```

**Приклад відповіді:**
```json
{
  "taskId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "BTCUSDT Scanner",
  "totalCycles": 150,
  "lastScanTime": "2024-01-15T10:30:00.000Z",
  "intervals": {
    "1m": {
      "lastSync": "2024-01-15T10:29:00.000Z",
      "count": 150,
      "frequencyInMinutes": 1,
      "nextScan": "2024-01-15T10:30:00.000Z",
      "timeUntilNextMinutes": 0,
      "shouldScanNow": true
    }
  }
}
```

### 5. `resetScanningParams()`
Скидає параметри сканування для конкретного інтервалу або всіх інтервалів.

```typescript
async resetScanningParams(taskId: string, interval?: KlineInterval): Promise<boolean>
```

### 6. `updateScanningFrequency()`
Оновлює частоту сканування для конкретного інтервалу.

```typescript
async updateScanningFrequency(
  taskId: string,
  interval: KlineInterval,
  frequencyInMinutes: number,
): Promise<boolean>
```

### 7. `getReadyIntervals()`
Отримує список інтервалів, які готові до сканування.

```typescript
async getReadyIntervals(taskId: string): Promise<KlineInterval[]>
```

## Логіка роботи

1. **Ініціалізація**: При першому запуску створюються параметри сканування з частотами за замовчуванням.

2. **Перевірка**: Перед кожним скануванням перевіряється чи минуло достатньо часу з останнього сканування для конкретного інтервалу.

3. **Оновлення**: Після успішного сканування оновлюється час останнього сканування та лічильник.

4. **Пропуск**: Якщо інтервал ще не готовий до сканування, він пропускається з відповідним логом.

## Переваги

- **Оптимізація ресурсів**: Зменшення навантаження на API та базу даних
- **Гнучкість**: Можливість налаштувати частоту для кожного таймфрейму окремо
- **Моніторинг**: Детальна статистика по кожному інтервалу
- **Адаптивність**: Можливість змінювати частоти в реальному часі

## Приклади використання

### Отримання статистики
```typescript
const stats = await futuresPairScannerService.getScanningStats(taskId);
console.log('Scanning stats:', stats);
```

### Оновлення частоти
```typescript
await futuresPairScannerService.updateScanningFrequency(
  taskId, 
  KlineInterval.ONE_MINUTE, 
  2 // кожні 2 хвилини
);
```

### Скидання параметрів
```typescript
// Скинути всі параметри
await futuresPairScannerService.resetScanningParams(taskId);

// Скинути тільки для 1m інтервалу
await futuresPairScannerService.resetScanningParams(taskId, KlineInterval.ONE_MINUTE);
```

### Отримання готових інтервалів
```typescript
const readyIntervals = await futuresPairScannerService.getReadyIntervals(taskId);
console.log('Ready intervals:', readyIntervals);
``` 