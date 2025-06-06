import { Controller } from '@nestjs/common';
import { VolumeStrategyService } from './volume-strategy.service';

@Controller('volume-strategy')
export class VolumeStrategyController {
  constructor(private readonly volumeStrategyService: VolumeStrategyService) {}
}
