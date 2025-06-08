import { Controller } from '@nestjs/common';
import { StrategiesHandlerService } from './strategies-handler.service';

@Controller('strategies-handler')
export class StrategiesHandlerController {
  constructor(private readonly strategiesHandlerService: StrategiesHandlerService) {}
}
