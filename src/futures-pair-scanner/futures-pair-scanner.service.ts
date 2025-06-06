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
    const futuresPair = await this.futuresPairModel.create({
      name: data.name,
      status: FuturesPairStatus.ACTIVE,
    });

    if (!futuresPair) {
      return null;
    }

    const taskId = futuresPair._id.toString();
    this.pairScannerTaskMap.set(taskId, true);

    return futuresPair;
  }
}
