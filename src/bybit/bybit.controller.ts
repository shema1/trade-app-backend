import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BybitService } from './bybit.service';
import { GetKlineDto } from './dto/get-kline.dto';
import { GetKlineBatchDto } from './dto/get-kline-batch.dto';

@ApiTags('Bybit')
@Controller('bybit')
export class BybitController {
  constructor(private readonly bybitService: BybitService) {}

  @Get('kline')
  @ApiOperation({ summary: 'Отримати дані клін з Bybit' })
  @ApiResponse({ status: 200, description: 'Успішно отримано дані клін' })
  @ApiResponse({ status: 400, description: 'Невірні параметри запиту' })
  @ApiResponse({ status: 500, description: 'Внутрішня помилка сервера' })
  async getKlineData(@Query() query: GetKlineDto) {
    return await this.bybitService.getKlineData(query);
  }

  @Get('kline-batch')
  @ApiOperation({ summary: 'Отримати дані клін з Bybit' })
  @ApiResponse({ status: 200, description: 'Успішно отримано дані клін' })
  @ApiResponse({ status: 400, description: 'Невірні параметри запиту' })
  @ApiResponse({ status: 500, description: 'Внутрішня помилка сервера' })
  async getKlineDataBatch(@Query() query: GetKlineBatchDto) {
    return await this.bybitService.getKlineDataBatch(query);
  }

  @Get('test')
  async test() {
    return await this.bybitService.test();
  }
}
