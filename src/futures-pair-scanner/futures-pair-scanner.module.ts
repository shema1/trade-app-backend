import { Module } from '@nestjs/common';
import { FuturesPairScannerService } from './futures-pair-scanner.service';
import { FuturesPairScannerController } from './futures-pair-scanner.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FuturesPair, FuturesPairSchema } from './schemas/futures-pair.schema';

@Module({
  controllers: [FuturesPairScannerController],
  providers: [FuturesPairScannerService],
  imports: [
    MongooseModule.forFeature([
      { name: FuturesPair.name, schema: FuturesPairSchema },
    ]),
  ],
})
export class FuturesPairScannerModule {}
