import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { WALLET_PATTERNS } from '../microservices/patterns';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有钱包' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  async getAllWallets(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return await this.walletsService.getAllWallets(page, limit);
  }

  @Get('address/:address')
  @ApiOperation({ summary: '根据地址获取钱包详情' })
  @ApiParam({ name: 'address', description: '钱包地址' })
  async getWalletByAddress(@Param('address') address: string) {
    const wallet = await this.walletsService.getWalletByAddress(address);
    if (!wallet) {
      return { error: '钱包不存在' };
    }
    return wallet;
  }

  @Get('address/:address/details')
  @ApiOperation({ summary: '获取钱包详情（包括资产）' })
  @ApiParam({ name: 'address', description: '钱包地址' })
  async getWalletDetails(@Param('address') address: string) {
    const details = await this.walletsService.getWalletDetails(address);
    if (!details) {
      return { error: '钱包不存在' };
    }
    return details;
  }

  @Get('address/:address/assets')
  @ApiOperation({ summary: '获取钱包资产' })
  @ApiParam({ name: 'address', description: '钱包地址' })
  async getWalletAssets(@Param('address') address: string) {
    const assets = await this.walletsService.getWalletAssets(address);
    return assets;
  }

  @Get('search')
  @ApiOperation({ summary: '搜索钱包' })
  @ApiQuery({ name: 'q', required: true, description: '搜索关键词' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '结果数量限制' })
  async searchWallets(
    @Query('q') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return await this.walletsService.searchWallets(query, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取钱包统计信息' })
  async getWalletStats() {
    return await this.walletsService.getWalletStats();
  }

  @Get('test')
  @ApiOperation({ summary: '测试钱包功能' })
  async testWalletFunctionality() {
    return await this.walletsService.testWalletFunctionality();
  }

  // 微服务消息处理器
  @MessagePattern(WALLET_PATTERNS.GET_ALL)
  async getAllWalletsMicroservice(@Payload() data: { page: number; limit: number }) {
    return await this.walletsService.getAllWallets(data.page || 1, data.limit || 10);
  }

  @MessagePattern(WALLET_PATTERNS.GET_DETAILS)
  async getWalletDetailsMicroservice(@Payload() data: { address: string }) {
    const details = await this.walletsService.getWalletDetails(data.address);
    if (!details) {
      return { error: '钱包不存在' };
    }
    return details;
  }

  @MessagePattern(WALLET_PATTERNS.GET_ASSETS)
  async getWalletAssetsMicroservice(@Payload() data: { address: string }) {
    return await this.walletsService.getWalletAssets(data.address);
  }

  @MessagePattern(WALLET_PATTERNS.SEARCH)
  async searchWalletsMicroservice(@Payload() data: { query: string }) {
    return await this.walletsService.searchWallets(data.query, 20);
  }

  @MessagePattern(WALLET_PATTERNS.GET_STATISTICS)
  async getWalletStatisticsMicroservice() {
    return await this.walletsService.getWalletStats();
  }

  @MessagePattern(WALLET_PATTERNS.TEST_FUNCTIONALITY)
  async testWalletFunctionalityMicroservice() {
    return await this.walletsService.testWalletFunctionality();
  }
} 