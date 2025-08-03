import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionsService } from '../transactions/transactions.service';
import { BlocksService } from '../blocks/blocks.service';
import { TransactionResponsesService } from '../transaction-responses/transaction-responses.service';
import { ParsedTransactionsService } from '../parsed-transactions/parsed-transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { Block } from '../entities/block.entity';
import { TransactionResponse } from '../entities/transaction-response.entity';
import { WalletsService } from '../wallets/wallets.service';
import { NetworkConfig } from '../config/network.config';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);
  private suiClient: SuiClient;
  private isScanning = false;
  private lastProcessedBlock = 0;

  constructor(
    private configService: ConfigService,
    private transactionsService: TransactionsService,
    private blocksService: BlocksService,
    private transactionResponsesService: TransactionResponsesService,
    private parsedTransactionsService: ParsedTransactionsService,
    private walletsService: WalletsService,
    private networkConfig: NetworkConfig,
  ) {
    const network = this.networkConfig.getCurrentNetwork();
    this.suiClient = new SuiClient({ url: network.rpcUrl });
    
    // 显示网络连接信息
    this.logger.log('='.repeat(60));
    this.logger.log(`🌐 当前网络环境: ${network.displayName}`);
    this.logger.log(`📡 RPC URL: ${network.rpcUrl}`);
    this.logger.log(`📝 网络描述: ${network.description}`);
    this.logger.log('='.repeat(60));
    
    this.initializeScanner().catch(error => {
      this.logger.error('监控服务初始化失败，程序将停止:', error);
      process.exit(1); // 退出程序
    });
  }



    private async initializeScanner() {
    try {
      // 首先尝试从数据库获取最新区块号
      const latestBlock = await this.blocksService.getLatestBlock();
      
      if (latestBlock) {
        this.lastProcessedBlock = latestBlock.blockNumber;
        this.logger.log(`从数据库中找到最新区块: ${this.lastProcessedBlock}`);
      } else {
        // 如果数据库中没有区块记录，从链上获取最新区块号
        this.logger.log('数据库中没有区块记录，从链上获取最新区块号...');
        
                // 从链上获取最新区块号
                  try {
            this.logger.log('尝试获取最新区块号...');
            const latestSequenceNumber = await this.suiClient.getLatestCheckpointSequenceNumber();
            this.lastProcessedBlock = parseInt(latestSequenceNumber);
            this.logger.log(`从链上获取最新区块号: ${this.lastProcessedBlock}`);
          } catch (checkpointError) {
            this.logger.error('获取最新区块号失败:', checkpointError);
            this.logger.error('错误详情:', {
              message: checkpointError.message,
              stack: checkpointError.stack,
              name: checkpointError.name
            });
            throw new Error(`获取最新区块号失败: ${checkpointError.message}`);
          }
      }
      
      this.logger.log(`初始化扫描器完成，从区块 ${this.lastProcessedBlock} 开始`);
    } catch (error) {
      this.logger.error('初始化扫描器失败:', error);
      this.logger.error('错误堆栈:', error.stack);
      this.logger.error('错误详情:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.status,
        statusText: error.statusText
      });
      throw error; // 重新抛出错误，停止程序执行
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async scanNewBlocks() {
    if (this.isScanning) {
      return;
    }

    this.isScanning = true;
    try {
      const network = this.networkConfig.getCurrentNetwork();
      this.logger.log(`🔍 [${network.displayName}] 开始扫描新区块...`);
      await this.processNewBlocks();
    } catch (error) {
      const network = this.networkConfig.getCurrentNetwork();
      this.logger.error(`❌ [${network.displayName}] 扫描新区块时出错:`, error);
    } finally {
      this.isScanning = false;
    }
  }

  private async processNewBlocks() {
    try {
      const network = this.networkConfig.getCurrentNetwork();
      // 简化处理：直接处理下一个区块，避免API问题
      const nextBlockNumber = this.lastProcessedBlock + 1;
      
      // 尝试处理下一个区块
      await this.processBlock(nextBlockNumber);
      
      this.lastProcessedBlock = nextBlockNumber;
      this.logger.log(`✅ [${network.displayName}] 成功处理区块 ${nextBlockNumber}`);
      
    } catch (error) {
      const network = this.networkConfig.getCurrentNetwork();
      this.logger.error(`❌ [${network.displayName}] 处理新区块失败:`, error);
      // 如果处理失败，跳过这个区块
      this.lastProcessedBlock += 1;
    }
  }

  private async processBlock(blockNumber: number) {
    try {
      const network = this.networkConfig.getCurrentNetwork();
      this.logger.log(`🔍 [${network.displayName}] 开始处理区块 ${blockNumber}`);
      
      // 获取区块详情
      const checkpoint = await this.suiClient.getCheckpoint({
        id: blockNumber.toString(),
      });
      
      if (!checkpoint) {
        this.logger.warn(`⚠️ [${network.displayName}] 区块 ${blockNumber} 不存在，跳过`);
        throw new Error(`区块 ${blockNumber} 不存在`);
      }

      this.logger.log(`📦 [${network.displayName}] 获取到区块 ${blockNumber}，包含 ${checkpoint.transactions.length} 笔交易`);

      // 检查区块是否已存在
      const existingBlock = await this.blocksService.findByNumber(blockNumber);
      if (existingBlock) {
        this.logger.log(`区块 ${blockNumber} 已存在，跳过`);
        return;
      }

      // 创建区块记录
      const blockData: Partial<Block> = {
        blockNumber: blockNumber,
        blockHash: checkpoint.digest,
        timestamp: new Date(parseInt(checkpoint.timestampMs)),
        proposer: checkpoint.epochRollingGasCostSummary?.computationCost || '0',
        transactionCount: checkpoint.transactions.length,
        totalGasUsed: 0,
        totalGasCost: 0,
        blockData: {
          ...this.deepSanitizeForDatabase(checkpoint),
          // 添加一些额外的元数据
          processedAt: new Date().toISOString(),
          version: '1.0'
        },
      };

              try {
          await this.blocksService.create(blockData);
          this.logger.log(`💾 [${network.displayName}] 区块 ${blockNumber} 记录已保存`);
        } catch (error) {
          this.logger.error(`❌ [${network.displayName}] 保存区块 ${blockNumber} 失败:`, error);
        // 如果是Unicode错误，尝试保存简化版本
        if (error.message && error.message.includes('Unicode')) {
          try {
            const simplifiedBlockData = {
              ...blockData,
              blockData: { 
                digest: checkpoint.digest,
                timestampMs: checkpoint.timestampMs,
                transactionCount: checkpoint.transactions.length,
                processedAt: new Date().toISOString(),
                version: '1.0'
              }
            };
            await this.blocksService.create(simplifiedBlockData);
            this.logger.log(`区块 ${blockNumber} 简化记录已保存`);
          } catch (simplifiedError) {
            this.logger.error(`保存区块 ${blockNumber} 简化记录也失败:`, simplifiedError);
          }
        }
      }

      // 处理区块中的交易
      const transactions: Partial<Transaction>[] = [];
      
      for (const txDigest of checkpoint.transactions) {
        try {
          const txData = await this.processTransaction(txDigest, blockNumber);
          if (txData) {
            transactions.push(txData);
          }
        } catch (error) {
          this.logger.error(`处理交易 ${txDigest} 失败:`, error);
        }
      }

      // 批量保存交易
      if (transactions.length > 0) {
        try {
          await this.transactionsService.createMany(transactions);
          this.logger.log(`💾 [${network.displayName}] 区块 ${blockNumber} 处理完成，保存了 ${transactions.length} 笔交易`);
        } catch (error) {
          this.logger.error(`❌ [${network.displayName}] 保存交易数据失败，尝试逐个保存:`, error);
          // 如果批量保存失败，尝试逐个保存
          let successCount = 0;
                      for (const tx of transactions) {
              try {
                await this.transactionsService.create(tx);
                successCount++;
              } catch (txError) {
                this.logger.error(`❌ [${network.displayName}] 保存交易 ${tx.digest} 失败:`, txError);
              }
            }
            this.logger.log(`💾 [${network.displayName}] 区块 ${blockNumber} 处理完成，成功保存了 ${successCount}/${transactions.length} 笔交易`);
        }
              } else {
          this.logger.log(`📭 [${network.displayName}] 区块 ${blockNumber} 处理完成，无交易数据`);
        }

    } catch (error) {
      this.logger.error(`处理区块 ${blockNumber} 失败:`, error);
      
      // 如果是重复键错误，记录但不抛出异常
      if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
        this.logger.warn(`区块 ${blockNumber} 已存在，跳过`);
        return;
      }
      
      throw error; // 重新抛出其他错误，让上层处理
    }
  }

  private async processTransaction(txDigest: string, blockNumber: number): Promise<Partial<Transaction> | null> {
    try {
      const network = this.networkConfig.getCurrentNetwork();
      const startTime = Date.now();

      // 检查交易是否已存在
      const existingTx = await this.transactionsService.findByDigest(txDigest);
      if (existingTx) {
        return null;
      }

      // 检查交易响应是否已存在
      const existingResponse = await this.transactionResponsesService.findByDigest(txDigest);
      if (existingResponse) {
        this.logger.log(`📋 [${network.displayName}] 交易响应已存在: ${txDigest}`);
        return null;
      }

      // 获取交易详情
      const txResponse = await this.suiClient.getTransactionBlock({
        digest: txDigest,
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });
      
      if (!txResponse) {
        return null;
      }

      // 保存完整的交易响应数据
      const transactionResponseData: Partial<TransactionResponse> = {
        digest: txDigest,
        blockNumber: blockNumber,
        timestamp: new Date(parseInt(txResponse.timestampMs || '0')),
        transaction: this.deepSanitizeForDatabase(txResponse.transaction),
        effects: this.deepSanitizeForDatabase(txResponse.effects),
        events: this.deepSanitizeForDatabase(txResponse.events),
        objectChanges: this.deepSanitizeForDatabase(txResponse.objectChanges),
        balanceChanges: this.deepSanitizeForDatabase(txResponse.balanceChanges),
        checkpoint: txResponse.checkpoint,
        timestampMs: txResponse.timestampMs,
        confirmedLocalExecution: txResponse.confirmedLocalExecution,
        rawResponse: this.deepSanitizeForDatabase(txResponse),
        metadata: {
          processedAt: new Date().toISOString(),
          version: '1.0',
          network: network.name,
          processingTime: Date.now() - startTime
        }
      };

      // 保存交易响应数据
      await this.transactionResponsesService.create(transactionResponseData);
      this.logger.log(`💾 [${network.displayName}] 交易响应已保存: ${txDigest}`);

      // 解析并保存交易信息
      const parsedTransaction = await this.parsedTransactionsService.parseAndSaveTransaction(txResponse, blockNumber, network.name);
      this.logger.log(`📊 [${network.displayName}] 交易解析完成: ${txDigest}`);

      // 处理钱包地址
      if (parsedTransaction) {
        await this.walletsService.processTransactionWallets(parsedTransaction);
        this.logger.log(`👛 [${network.displayName}] 钱包地址处理完成: ${txDigest}`);
      }

      // 解析交易数据（用于原有的transactions表）
      const txData: Partial<Transaction> = {
        digest: txDigest,
        blockNumber: blockNumber,
        timestamp: new Date(parseInt(txResponse.timestampMs || '0')),
        status: txResponse.effects?.status?.status || 'unknown',
        effects: this.deepSanitizeForDatabase(txResponse.effects),
        events: this.deepSanitizeForDatabase(txResponse.events),
        gasUsed: txResponse.effects?.gasUsed?.computationCost || '0',
        gasPrice: '0',
        gasCost: 0,
        // 保存简化的交易响应数据
        arguments: {
          transaction: this.deepSanitizeForDatabase(txResponse.transaction),
          timestampMs: txResponse.timestampMs,
          checkpoint: this.deepSanitizeForDatabase(txResponse.checkpoint),
          processedAt: new Date().toISOString(),
          version: '1.0'
        }
      };

      // 简化交易类型解析
      txData.transactionType = 'Unknown';
      
      // 解析发送者
      if (txResponse.transaction?.data?.sender) {
        txData.sender = txResponse.transaction.data.sender;
      }

      return txData;
    } catch (error) {
      const network = this.networkConfig.getCurrentNetwork();
      this.logger.error(`❌ [${network.displayName}] 处理交易失败: ${txDigest}`, error);
      return null;
    }
  }

  /**
   * 清理数据中的Unicode转义序列，避免数据库存储错误
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'string') {
      // 更彻底的Unicode清理
      return data
        .replace(/\\u[0-9a-fA-F]{4}/g, '') // 移除Unicode转义序列
        .replace(/\\x[0-9a-fA-F]{2}/g, '') // 移除十六进制转义序列
        .replace(/\\[0-7]{3}/g, '') // 移除八进制转义序列
        .replace(/\\[bfnrtv]/g, '') // 移除控制字符转义序列
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // 移除控制字符
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * 深度清理JSON数据，确保可以安全存储到数据库
   */
  private deepSanitizeForDatabase(data: any): any {
    try {
      // 先进行基本清理
      const sanitized = this.sanitizeData(data);
      
      // 尝试JSON序列化和反序列化，确保数据格式正确
      const jsonString = JSON.stringify(sanitized);
      const parsed = JSON.parse(jsonString);
      
      return parsed;
    } catch (error) {
      this.logger.warn('数据清理失败，使用原始数据:', error);
      // 如果清理失败，返回null或空对象
      return null;
    }
  }

  async getScannerStatus() {
    const network = this.networkConfig.getCurrentNetwork();
    return {
      isScanning: this.isScanning,
      lastProcessedBlock: this.lastProcessedBlock,
      timestamp: new Date(),
      network: {
        name: network.name,
        displayName: network.displayName,
        description: network.description
      }
    };
  }

  async startScanning() {
    this.isScanning = true;
    this.logger.log('手动启动扫描');
  }

  async stopScanning() {
    this.isScanning = false;
    this.logger.log('手动停止扫描');
  }

  async resetScanner() {
    this.isScanning = false;
    this.logger.log('扫描器已重置');
    try {
      await this.initializeScanner();
    } catch (error) {
      this.logger.error('重置扫描器失败:', error);
      throw error; // 重新抛出错误
    }
  }

  async testSuiConnection() {
    try {
      this.logger.log('测试Sui RPC连接...');
      
      // 测试1: 获取最新区块号
      const latestSequenceNumber = await this.suiClient.getLatestCheckpointSequenceNumber();
      this.logger.log('✅ 获取最新区块号成功:', {
        sequenceNumber: latestSequenceNumber
      });

      // 测试2: 获取系统状态
      const systemState = await this.suiClient.getLatestSuiSystemState();
      this.logger.log('✅ 获取系统状态成功:', {
        epoch: systemState.epoch,
        protocolVersion: systemState.protocolVersion
      });

      return {
        success: true,
        latestBlock: latestSequenceNumber,
        epoch: systemState.epoch
      };
    } catch (error) {
      this.logger.error('❌ Sui RPC连接测试失败:', error);
      this.logger.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 微服务需要的方法
  async getStatus() {
    return this.getScannerStatus();
  }

  async startMonitoring() {
    await this.startScanning();
    return { success: true, message: '监控已启动' };
  }

  async stopMonitoring() {
    await this.stopScanning();
    return { success: true, message: '监控已停止' };
  }

  async resetMonitoring() {
    await this.resetScanner();
    return { success: true, message: '监控已重置' };
  }

  async testConnection() {
    return this.testSuiConnection();
  }

  async getNetworkInfo() {
    const network = this.networkConfig.getCurrentNetwork();
    return {
      name: network.name,
      displayName: network.displayName,
      rpcUrl: network.rpcUrl,
      wsUrl: network.wsUrl,
      description: network.description,
    };
  }

  async getNetworks() {
    return this.networkConfig.getAllNetworks();
  }

  async getNetwork(name: string) {
    return this.networkConfig.getNetwork(name);
  }
}