import { Controller, Get } from '@nestjs/common';
import { FuturesPairScannerService } from './futures-pair-scanner.service';

@Controller('futures-pair-scanner')
export class FuturesPairScannerController {
  constructor(
    private readonly futuresPairScannerService: FuturesPairScannerService,
  ) {}

  @Get('execute-strategy')
  async executeStrategy() {
    return this.futuresPairScannerService.runAnalysis('123');
  }
}
