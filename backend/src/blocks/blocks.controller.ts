import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BlocksService } from './blocks.service';
import { BLOCK_PATTERNS } from '../microservices/patterns';

@ApiTags('blocks')
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  @ApiOperation({ summary: '获取所有区块' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.blocksService.findAll(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取区块统计信息' })
  async getStats() {
    return this.blocksService.getBlockStats();
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取区块统计信息' })
  async getStatistics() {
    return this.blocksService.getBlockStats();
  }

  @Get('count')
  @ApiOperation({ summary: '获取区块总数' })
  async getCount() {
    const count = await this.blocksService.count();
    return { count };
  }

  @Get('latest')
  @ApiOperation({ summary: '获取最新区块' })
  async getLatest() {
    return this.blocksService.getLatestBlock();
  }

  @Get('number/:number')
  @ApiOperation({ summary: '根据区块号获取区块' })
  @ApiParam({ name: 'number', description: '区块号' })
  async findByNumber(@Param('number', ParseIntPipe) number: number) {
    return this.blocksService.findByNumber(number);
  }

  @Get(':blockNumber')
  @ApiOperation({ summary: '根据区块号获取区块' })
  @ApiParam({ name: 'blockNumber', description: '区块号' })
  async getByNumber(@Param('blockNumber', ParseIntPipe) blockNumber: number) {
    return this.blocksService.findByNumber(blockNumber);
  }

  @Get('hash/:hash')
  @ApiOperation({ summary: '根据区块哈希获取区块' })
  @ApiParam({ name: 'hash', description: '区块哈希' })
  async findByHash(@Param('hash') hash: string) {
    return this.blocksService.findByHash(hash);
  }

  @Get('date-range')
  @ApiOperation({ summary: '根据日期范围获取区块' })
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
    return this.blocksService.findByDateRange(new Date(startDate), new Date(endDate), page, limit);
  }

  @Get('time-range')
  @ApiOperation({ summary: '根据时间范围获取区块' })
  @ApiQuery({ name: 'startTime', required: true, description: '开始时间 (ISO格式)' })
  @ApiQuery({ name: 'endTime', required: true, description: '结束时间 (ISO格式)' })
  async findByTimeRange(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.blocksService.findByDateRange(new Date(startTime), new Date(endTime), 1, 1000);
  }

  @Get('number/:number/checkpoint')
  @ApiOperation({ summary: '获取区块的完整checkpoint信息' })
  @ApiParam({ name: 'number', description: '区块号' })
  async getCheckpointData(@Param('number', ParseIntPipe) number: number) {
    const block = await this.blocksService.findByNumber(number);
    if (!block) {
      return { error: '区块不存在' };
    }
    return {
      blockNumber: block.blockNumber,
      blockHash: block.blockHash,
      timestamp: block.timestamp,
      transactionCount: block.transactionCount,
      checkpointData: block.blockData
    };
  }

  // 微服务消息处理器
  @MessagePattern(BLOCK_PATTERNS.GET_LATEST)
  async getLatestBlocks(@Payload() data: { limit: number }) {
    return this.blocksService.findAll(1, data.limit || 10);
  }

  @MessagePattern(BLOCK_PATTERNS.GET_BY_NUMBER)
  async getBlockByNumber(@Payload() data: { blockNumber: number }) {
    return this.blocksService.findByNumber(data.blockNumber);
  }

  @MessagePattern(BLOCK_PATTERNS.GET_COUNT)
  async getBlockCount() {
    const count = await this.blocksService.count();
    return { count };
  }

  @MessagePattern(BLOCK_PATTERNS.GET_STATISTICS)
  async getBlockStatistics() {
    return this.blocksService.getBlockStats();
  }

  @MessagePattern(BLOCK_PATTERNS.GET_TIME_RANGE)
  async getBlocksByTimeRange(@Payload() data: { startTime: string; endTime: string }) {
    return this.blocksService.findByDateRange(new Date(data.startTime), new Date(data.endTime), 1, 1000);
  }
} 