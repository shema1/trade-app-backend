import { KlineCategory, KlineInterval } from '../dto/get-kline.dto';

export interface KlineDataItem {
  timestamp: number; // Часова мітка у мілісекундах (наприклад, 1741418520000)
  open: number; // Ціна відкриття свічки (наприклад, 86441.5)
  high: number; // Максимальна ціна за період (наприклад, 86441.5)
  low: number; // Мінімальна ціна за період (наприклад, 86422.7)
  close: number; // Ціна закриття свічки (наприклад, 86423.4)
  volume: number; // Об'єм торгів за період (наприклад, 6.127)
}

export interface KlineDataItemBatch {
  symbol: string;
  interval: KlineInterval;
  limit: number;
  list: KlineDataItem[];
  category: KlineCategory;
}
