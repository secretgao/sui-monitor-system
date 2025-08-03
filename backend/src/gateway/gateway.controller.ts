import { Controller, Get, Post, Param, Query, Body, UseInterceptors, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy, Transport } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { microservicesConfig } from '../microservices/microservices.config';
import { 
  MONITOR_PATTERNS, 
  TRANSACTION_PATTERNS, 
  WALLET_PATTERNS, 
  BLOCK_PATTERNS 
} from '../microservices/patterns';

@ApiTags('API Gateway')
@Controller('api')
export class GatewayController {
  constructor(
    @Inject('MONITOR_SERVICE') private monitorClient: ClientProxy,
    @Inject('TRANSACTION_SERVICE') private transactionClient: ClientProxy,
    @Inject('WALLET_SERVICE') private walletClient: ClientProxy,
    @Inject('BLOCK_SERVICE') private blockClient: ClientProxy,
  ) {}

  // Monitor Service 路由
  @Get('monitor/status')
  @ApiOperation({ summary: '获取监控状态' })
  async getMonitorStatus() {
    return await firstValueFrom(
      this.monitorClient.send(MONITOR_PATTERNS.GET_STATUS, {})
    );
  }

  @Post('monitor/start')
  @ApiOperation({ summary: '开始监控' })
  async startMonitoring() {
    try {
      return await firstValueFrom(
        this.monitorClient.send(MONITOR_PATTERNS.START_MONITORING, {})
      );
    } catch (error) {
      console.error('启动监控失败:', error);
      throw error;
    }
  }

  @Post('monitor/stop')
  @ApiOperation({ summary: '停止监控' })
  async stopMonitoring() {
    return await firstValueFrom(
      this.monitorClient.send(MONITOR_PATTERNS.STOP_MONITORING, {})
    );
  }

  @Post('monitor/reset')
  @ApiOperation({ summary: '重置监控' })
  async resetMonitoring() {
    return await firstValueFrom(
      this.monitorClient.send(MONITOR_PATTERNS.RESET_MONITORING, {})
    );
  }

  @Get('monitor/test-connection')
  @ApiOperation({ summary: '测试连接' })
  async testConnection() {
    return await firstValueFrom(
      this.monitorClient.send(MONITOR_PATTERNS.TEST_CONNECTION, {})
    );
  }

  @Get('monitor/network-info')
  @ApiOperation({ summary: '获取网络信息' })
  async getNetworkInfo() {
    return await firstValueFrom(
      this.monitorClient.send(MONITOR_PATTERNS.GET_NETWORK_INFO, {})
    );
  }

  @Get('monitor/networks')
  @ApiOperation({ summary: '获取所有网络' })
  async getNetworks() {
    return await firstValueFrom(
      this.monitorClient.send(MONITOR_PATTERNS.GET_NETWORKS, {})
    );
  }

  @Get('monitor/network/:name')
  @ApiOperation({ summary: '获取指定网络' })
  @ApiParam({ name: 'name', description: '网络名称' })
  async getNetwork(@Param('name') name: string) {
    return await firstValueFrom(
      this.monitorClient.send(MONITOR_PATTERNS.GET_NETWORK, { name })
    );
  }

  // Transaction Service 路由
  @Get('transactions/latest')
  @ApiOperation({ summary: '获取最新交易' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量' })
  async getLatestTransactions(@Query('limit') limit = 10) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_LATEST, { limit })
    );
  }

  @Get('transactions/digest/:digest')
  @ApiOperation({ summary: '根据哈希获取交易' })
  @ApiParam({ name: 'digest', description: '交易哈希' })
  async getTransactionByDigest(@Param('digest') digest: string) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_BY_DIGEST, { digest })
    );
  }

  @Get('transactions/block/:blockNumber')
  @ApiOperation({ summary: '根据区块获取交易' })
  @ApiParam({ name: 'blockNumber', description: '区块号' })
  async getTransactionsByBlock(@Param('blockNumber') blockNumber: number) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_BY_BLOCK, { blockNumber })
    );
  }

  @Get('transactions/sender/:sender')
  @ApiOperation({ summary: '根据发送者获取交易' })
  @ApiParam({ name: 'sender', description: '发送者地址' })
  async getTransactionsBySender(@Param('sender') sender: string) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_BY_SENDER, { sender })
    );
  }

  @Get('transactions/count')
  @ApiOperation({ summary: '获取交易总数' })
  async getTransactionCount() {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_COUNT, {})
    );
  }

  @Get('transactions/statistics')
  @ApiOperation({ summary: '获取交易统计' })
  async getTransactionStatistics() {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_STATISTICS, {})
    );
  }

  // Parsed Transactions 路由
  @Get('parsed-transactions')
  @ApiOperation({ summary: '获取解析交易列表' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  async getParsedTransactions(@Query('limit') limit = 10, @Query('page') page = 1) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_LATEST, { limit })
    );
  }

  @Get('parsed-transactions/latest')
  @ApiOperation({ summary: '获取最新解析交易' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量' })
  async getLatestParsedTransactions(@Query('limit') limit = 10) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_LATEST, { limit })
    );
  }

  @Get('parsed-transactions/type/:type')
  @ApiOperation({ summary: '根据类型获取解析交易' })
  @ApiParam({ name: 'type', description: '交易类型' })
  async getParsedTransactionsByType(@Param('type') type: string) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_BY_TYPE, { type })
    );
  }

  @Get('parsed-transactions/statistics')
  @ApiOperation({ summary: '获取解析交易统计' })
  async getParsedTransactionStatistics() {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_STATISTICS, {})
    );
  }

  @Get('parsed-transactions/types')
  @ApiOperation({ summary: '获取交易类型列表' })
  async getTransactionTypes() {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_TRANSACTION_TYPES, {})
    );
  }

  @Get('parsed-transactions/digest/:digest')
  @ApiOperation({ summary: '根据交易哈希获取解析交易' })
  @ApiParam({ name: 'digest', description: '交易哈希' })
  async getParsedTransactionByDigest(@Param('digest') digest: string) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_BY_DIGEST, { digest })
    );
  }

  @Get('parsed-transactions/block/:blockNumber')
  @ApiOperation({ summary: '根据区块号获取解析交易' })
  @ApiParam({ name: 'blockNumber', description: '区块号' })
  async getParsedTransactionsByBlock(@Param('blockNumber') blockNumber: number) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_BY_BLOCK, { blockNumber })
    );
  }

  @Get('parsed-transactions/sender/:sender')
  @ApiOperation({ summary: '根据发送者获取解析交易' })
  @ApiParam({ name: 'sender', description: '发送者地址' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量' })
  async getParsedTransactionsBySender(@Param('sender') sender: string, @Query('limit') limit = 50) {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_BY_SENDER, { sender, limit })
    );
  }

  @Get('parsed-transactions/count')
  @ApiOperation({ summary: '获取解析交易总数' })
  async getParsedTransactionCount() {
    return await firstValueFrom(
      this.transactionClient.send(TRANSACTION_PATTERNS.GET_PARSED_COUNT, {})
    );
  }

  // Wallet Service 路由
  @Get('wallets')
  @ApiOperation({ summary: '获取钱包列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  async getWallets(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await firstValueFrom(
      this.walletClient.send(WALLET_PATTERNS.GET_ALL, { page, limit })
    );
  }

  @Get('wallets/:address')
  @ApiOperation({ summary: '获取钱包详情' })
  @ApiParam({ name: 'address', description: '钱包地址' })
  async getWalletDetails(@Param('address') address: string) {
    return await firstValueFrom(
      this.walletClient.send(WALLET_PATTERNS.GET_DETAILS, { address })
    );
  }

  @Get('wallets/:address/assets')
  @ApiOperation({ summary: '获取钱包资产' })
  @ApiParam({ name: 'address', description: '钱包地址' })
  async getWalletAssets(@Param('address') address: string) {
    return await firstValueFrom(
      this.walletClient.send(WALLET_PATTERNS.GET_ASSETS, { address })
    );
  }

  @Get('wallets/search/:query')
  @ApiOperation({ summary: '搜索钱包' })
  @ApiParam({ name: 'query', description: '搜索查询' })
  async searchWallets(@Param('query') query: string) {
    return await firstValueFrom(
      this.walletClient.send(WALLET_PATTERNS.SEARCH, { query })
    );
  }

  @Get('wallets/statistics')
  @ApiOperation({ summary: '获取钱包统计' })
  async getWalletStatistics() {
    return await firstValueFrom(
      this.walletClient.send(WALLET_PATTERNS.GET_STATISTICS, {})
    );
  }

  @Get('wallets/test')
  @ApiOperation({ summary: '测试钱包功能' })
  async testWalletFunctionality() {
    return await firstValueFrom(
      this.walletClient.send(WALLET_PATTERNS.TEST_FUNCTIONALITY, {})
    );
  }

  // Block Service 路由
  @Get('blocks/latest')
  @ApiOperation({ summary: '获取最新区块' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量' })
  async getLatestBlocks(@Query('limit') limit = 10) {
    return await firstValueFrom(
      this.blockClient.send(BLOCK_PATTERNS.GET_LATEST, { limit })
    );
  }

  @Get('blocks/:blockNumber')
  @ApiOperation({ summary: '根据区块号获取区块' })
  @ApiParam({ name: 'blockNumber', description: '区块号' })
  async getBlockByNumber(@Param('blockNumber') blockNumber: number) {
    return await firstValueFrom(
      this.blockClient.send(BLOCK_PATTERNS.GET_BY_NUMBER, { blockNumber })
    );
  }

  @Get('blocks/count')
  @ApiOperation({ summary: '获取区块总数' })
  async getBlockCount() {
    return await firstValueFrom(
      this.blockClient.send(BLOCK_PATTERNS.GET_COUNT, {})
    );
  }

  @Get('blocks/statistics')
  @ApiOperation({ summary: '获取区块统计' })
  async getBlockStatistics() {
    return await firstValueFrom(
      this.blockClient.send(BLOCK_PATTERNS.GET_STATISTICS, {})
    );
  }
} 