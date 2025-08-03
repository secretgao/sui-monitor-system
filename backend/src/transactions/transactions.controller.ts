import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ParsedTransactionsService } from '../parsed-transactions/parsed-transactions.service';
import { TRANSACTION_PATTERNS } from '../microservices/patterns';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly parsedTransactionsService: ParsedTransactionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取所有交易' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.transactionsService.findAll(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取交易统计信息' })
  async getStats() {
    return this.transactionsService.getTransactionStats();
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取交易统计信息' })
  async getStatistics() {
    return this.transactionsService.getTransactionStats();
  }

  @Get('count')
  @ApiOperation({ summary: '获取交易总数' })
  async getCount() {
    const count = await this.transactionsService.count();
    return { count };
  }

  @Get('block/:blockNumber')
  @ApiOperation({ summary: '根据区块号获取交易' })
  @ApiParam({ name: 'blockNumber', description: '区块号' })
  async findByBlockNumber(@Param('blockNumber', ParseIntPipe) blockNumber: number) {
    return this.transactionsService.findByBlockNumber(blockNumber);
  }

  @Get('sender/:sender')
  @ApiOperation({ summary: '根据发送者地址获取交易' })
  @ApiParam({ name: 'sender', description: '发送者地址' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '数量限制' })
  async findBySender(
    @Param('sender') sender: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ) {
    return this.transactionsService.findBySender(sender, limit);
  }

  @Get('digest/:digest')
  @ApiOperation({ summary: '根据交易哈希获取交易详情' })
  @ApiParam({ name: 'digest', description: '交易哈希' })
  async findByDigest(@Param('digest') digest: string) {
    return this.transactionsService.findByDigest(digest);
  }

  @Get('address/:address')
  @ApiOperation({ summary: '根据地址获取交易' })
  @ApiParam({ name: 'address', description: '钱包地址' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  async findByAddress(
    @Param('address') address: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.transactionsService.findByAddress(address, page, limit);
  }

  @Get('type/:type')
  @ApiOperation({ summary: '根据交易类型获取交易' })
  @ApiParam({ name: 'type', description: '交易类型' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  async findByType(
    @Param('type') type: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.transactionsService.findByTransactionType(type, page, limit);
  }

  @Get('date-range')
  @ApiOperation({ summary: '根据日期范围获取交易' })
  @ApiQuery({ name: 'startDate', required: true, description: '开始日期 (ISO格式)' })
  @ApiQuery({ name: 'endDate', required: true, description: '结束日期 (ISO格式)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.transactionsService.findByDateRange(new Date(startDate), new Date(endDate), page, limit);
  }

  @Get('time-range')
  @ApiOperation({ summary: '根据时间范围获取交易' })
  @ApiQuery({ name: 'startTime', required: true, description: '开始时间 (ISO格式)' })
  @ApiQuery({ name: 'endTime', required: true, description: '结束时间 (ISO格式)' })
  async findByTimeRange(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.transactionsService.findByDateRange(new Date(startTime), new Date(endTime), 1, 1000);
  }

  // 微服务消息处理器
  @MessagePattern(TRANSACTION_PATTERNS.GET_LATEST)
  async getLatestTransactions(@Payload() data: { limit: number }) {
    return this.transactionsService.findAll(1, data.limit || 10);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_BY_DIGEST)
  async getTransactionByDigest(@Payload() data: { digest: string }) {
    return this.transactionsService.findByDigest(data.digest);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_BY_BLOCK)
  async getTransactionsByBlock(@Payload() data: { blockNumber: number }) {
    return this.transactionsService.findByBlockNumber(data.blockNumber);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_BY_SENDER)
  async getTransactionsBySender(@Payload() data: { sender: string }) {
    return this.transactionsService.findBySender(data.sender, 50);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_COUNT)
  async getTransactionCount() {
    const count = await this.transactionsService.count();
    return { count };
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_STATISTICS)
  async getTransactionStatistics() {
    return this.transactionsService.getTransactionStats();
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_TIME_RANGE)
  async getTransactionsByTimeRange(@Payload() data: { startTime: string; endTime: string }) {
    return this.transactionsService.findByDateRange(new Date(data.startTime), new Date(data.endTime), 1, 1000);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_PARSED_LATEST)
  async getLatestParsedTransactions(@Payload() data: { limit: number }) {
    return await this.parsedTransactionsService.getLatest(data.limit || 10);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_PARSED_BY_DIGEST)
  async getParsedTransactionByDigest(@Payload() data: { digest: string }) {
    return await this.parsedTransactionsService.findByDigest(data.digest);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_PARSED_BY_TYPE)
  async getParsedTransactionsByType(@Payload() data: { type: string }) {
    return await this.parsedTransactionsService.findByTransactionType(data.type, 50);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_PARSED_BY_BLOCK)
  async getParsedTransactionsByBlock(@Payload() data: { blockNumber: number }) {
    return await this.parsedTransactionsService.findByBlockNumber(data.blockNumber);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_PARSED_BY_SENDER)
  async getParsedTransactionsBySender(@Payload() data: { sender: string; limit: number }) {
    return await this.parsedTransactionsService.findBySender(data.sender, data.limit || 50);
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_PARSED_COUNT)
  async getParsedTransactionCount() {
    const count = await this.parsedTransactionsService.count();
    return { count };
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_PARSED_STATISTICS)
  async getParsedTransactionStatistics() {
    return await this.parsedTransactionsService.getStatistics();
  }

  @MessagePattern(TRANSACTION_PATTERNS.GET_TRANSACTION_TYPES)
  async getTransactionTypes() {
    return await this.parsedTransactionsService.getTransactionTypes();
  }
} 