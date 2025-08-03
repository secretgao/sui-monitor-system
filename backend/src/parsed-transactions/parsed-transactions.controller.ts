import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParsedTransactionsService } from './parsed-transactions.service';

@Controller('parsed-transactions')
export class ParsedTransactionsController {
  constructor(
    private readonly parsedTransactionsService: ParsedTransactionsService,
  ) {}

  @Get()
  async getLatest(@Query('limit') limit: number = 10) {
    return await this.parsedTransactionsService.getLatest(limit);
  }

  @Get('digest/:digest')
  async getByDigest(@Param('digest') digest: string) {
    return await this.parsedTransactionsService.findByDigest(digest);
  }

  @Get('block/:blockNumber')
  async getByBlockNumber(@Param('blockNumber') blockNumber: number) {
    return await this.parsedTransactionsService.findByBlockNumber(blockNumber);
  }

  @Get('sender/:sender')
  async getBySender(
    @Param('sender') sender: string,
    @Query('limit') limit: number = 50
  ) {
    return await this.parsedTransactionsService.findBySender(sender, limit);
  }

  @Get('recipient/:recipient')
  async getByRecipient(
    @Param('recipient') recipient: string,
    @Query('limit') limit: number = 50
  ) {
    return await this.parsedTransactionsService.findByRecipient(recipient, limit);
  }

  @Get('type/:transactionType')
  async getByTransactionType(
    @Param('transactionType') transactionType: string,
    @Query('limit') limit: number = 50
  ) {
    return await this.parsedTransactionsService.findByTransactionType(transactionType, limit);
  }

  @Get('token/:coinType')
  async getByToken(
    @Param('coinType') coinType: string,
    @Query('limit') limit: number = 50
  ) {
    return await this.parsedTransactionsService.findByToken(coinType, limit);
  }

  @Get('statistics')
  async getStatistics() {
    return await this.parsedTransactionsService.getStatistics();
  }

  @Get('transaction-types')
  async getTransactionTypes() {
    return await this.parsedTransactionsService.getTransactionTypes();
  }

  @Get('count')
  async getCount() {
    const count = await this.parsedTransactionsService.count();
    return { count };
  }

  @Get('time-range')
  async getByTimeRange(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return await this.parsedTransactionsService.findByTimeRange(start, end);
  }

  @Get('wallet/:address/stats')
  async getWalletStats(@Param('address') address: string) {
    return await this.parsedTransactionsService.getWalletActivityStats(address);
  }

  @Get('token/:coinType/stats')
  async getTokenStats(@Param('coinType') coinType: string) {
    return await this.parsedTransactionsService.getTokenActivityStats(coinType);
  }

  @Get('search')
  async searchTransactions(
    @Query('address') address?: string,
    @Query('type') type?: string,
    @Query('token') token?: string,
    @Query('status') status?: 'success' | 'failure',
    @Query('limit') limit: number = 50
  ) {
    // 这里可以实现更复杂的搜索逻辑
    if (address) {
      return await this.parsedTransactionsService.findBySender(address, limit);
    }
    if (type) {
      return await this.parsedTransactionsService.findByTransactionType(type, limit);
    }
    if (token) {
      return await this.parsedTransactionsService.findByToken(token, limit);
    }
    
    return await this.parsedTransactionsService.getLatest(limit);
  }
} 