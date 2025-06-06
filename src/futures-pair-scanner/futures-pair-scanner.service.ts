import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FuturesPair, FuturesPairStatus } from './schemas/futures-pair.schema';
import { StartScanningDto } from './dto/start-scanning.dto';

@Injectable()
export class FuturesPairScannerService {
  private pairScannerTaskMap: Map<string, boolean> = new Map();
  private scanInProgress: Map<string, boolean> = new Map();
  private readonly SCAN_INTERVAL = 120000;

  constructor(
    @InjectModel(FuturesPair.name)
    private readonly futuresPairModel: Model<FuturesPair>,
  ) {}

  async startScanning(data: StartScanningDto): Promise<FuturesPair | null> {
    try {
      const futuresPair = await this.futuresPairModel.create({
        name: data.name,
        status: FuturesPairStatus.ACTIVE,
      });

      if (!futuresPair) {
        return null;
      }

      const taskId = futuresPair._id.toString();
      this.pairScannerTaskMap.set(taskId, true);

      // this.runContinuousScanning(futuresPair);

      return futuresPair;
    } catch (error) {
      console.error(`Error starting scanning for ${data.name}:`, error);
      return null;
    }
  }

  // private async runContinuousScanning(futuresPair: FuturesPair): Promise<void> {
  //   const taskId = futuresPair._id.toString();

  //   try {
  //     while (true) {
  //       // Перевіряємо чи не зупинено сканування
  //       const updatedPair = await this.futuresPairModel.findById(
  //         futuresPair._id,
  //       );
  //       if (
  //         !updatedPair ||
  //         updatedPair.status !== 'ACTIVE' ||
  //         !this.pairScannerTaskMap.has(taskId)
  //       ) {
  //         console.log('Scanning stopped for:', taskId);
  //         break;
  //       }

  //       // Перевіряємо чи не виконується вже сканування
  //       if (this.scanInProgress.get(taskId)) {
  //         await this.sleep(1000);
  //         continue;
  //       }

  //       try {
  //         this.scanInProgress.set(taskId, true);
  //         await this.executeStrategy(futuresPair);
  //       } catch (error) {
  //         console.error(`Error executing strategy for ${taskId}:`, error);
  //       } finally {
  //         this.scanInProgress.set(taskId, false);
  //       }

  //       // Чекаємо перед наступним скануванням
  //       console.log('Waiting for next scan...');
  //       await this.sleep(this.SCAN_INTERVAL);
  //     }
  //   } catch (error) {
  //     console.error(`Error in continuous scanning for ${taskId}:`, error);
  //   } finally {
  //     // Прибираємо таску при завершенні
  //     this.pairScannerTaskMap.delete(taskId);
  //     this.scanInProgress.delete(taskId);
  //     console.log('Scanning process finished:', taskId);
  //   }
  // }

  // private async executeStrategy(futuresPair: FuturesPair): Promise<void> {
  //   try {
  //     const klineData = await this.getKlineDataBatch(
  //       futuresPair.params.interval,
  //       futuresPair.params.limit,
  //     );

  //     if (!klineData) {
  //       console.warn('No kline data found');
  //       return;
  //     }

  //     const handleStrategyResult: StrategiesResult = {};
  //     for (const strategy of futuresPair.strategies) {
  //       if (
  //         strategy.strategyType === FuturesPairStrategyType.MOMENTUM_EMA_CROSS
  //       ) {
  //         const results = await this.scanPairsMomentumEmaCross(
  //           futuresPair,
  //           klineData,
  //         );
  //         handleStrategyResult.momentumEmaCross = results;
  //       }

  //       if (strategy.strategyType === FuturesPairStrategyType.VOLUME) {
  //         const results = await this.scanPairsVolume(futuresPair, klineData);
  //         handleStrategyResult.volume = results;
  //       }
  //     }
  //     await this.handleStrategyResult(futuresPair, handleStrategyResult);
  //   } catch (error) {
  //     console.error('Error in executeStrategy:', error);
  //   }
  // }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
