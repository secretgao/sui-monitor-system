import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionResponsesService } from './transaction-responses.service';

@Controller('transaction-responses')
export class TransactionResponsesController {
  constructor(
    private readonly transactionResponsesService: TransactionResponsesService,
  ) {}

  @Get()
  async getLatest(@Query('limit') limit: number = 10) {
    return await this.transactionResponsesService.getLatest(limit);
  }

  @Get('digest/:digest')
  async getByDigest(@Param('digest') digest: string) {
    return await this.transactionResponsesService.findByDigest(digest);
  }

  @Get('block/:blockNumber')
  async getByBlockNumber(@Param('blockNumber') blockNumber: number) {
    return await this.transactionResponsesService.findByBlockNumber(blockNumber);
  }

  @Get('statistics')
  async getStatistics() {
    return await this.transactionResponsesService.getStatistics();
  }

  @Get('count')
  async getCount() {
    const count = await this.transactionResponsesService.count();
    return { count };
  }

  @Get('time-range')
  async getByTimeRange(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return await this.transactionResponsesService.findByTimeRange(start, end);
  }
} 