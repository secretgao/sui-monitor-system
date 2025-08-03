import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParsedTransaction } from '../entities/parsed-transaction.entity';
import { TransactionParserService, ParsedTransactionInfo } from '../transaction-responses/transaction-parser.service';

@Injectable()
export class ParsedTransactionsService {
  private readonly logger = new Logger(ParsedTransactionsService.name);

  constructor(
    @InjectRepository(ParsedTransaction)
    private parsedTransactionRepository: Repository<ParsedTransaction>,
    private transactionParserService: TransactionParserService,
  ) {}

  /**
   * 解析并保存交易信息
   */
  async parseAndSaveTransaction(txResponse: any, blockNumber: number, network: string): Promise<ParsedTransaction> {
    try {
      // 检查是否已存在
      const existing = await this.findByDigest(txResponse.digest);
      if (existing) {
        this.logger.log(`📋 解析交易已存在: ${txResponse.digest}`);
        return existing;
      }

      // 解析交易数据
      const parsedInfo = this.transactionParserService.parseTransactionResponse(txResponse, blockNumber);
      
      // 生成交易摘要
      const summary = this.transactionParserService.generateTransactionSummary(parsedInfo);
      
      // 创建解析交易记录
      const parsedTransaction = this.parsedTransactionRepository.create({
        digest: parsedInfo.digest,
        blockNumber: parsedInfo.blockNumber,
        timestamp: parsedInfo.timestamp,
        sender: parsedInfo.sender,
        recipients: parsedInfo.recipients,
        involvedAddresses: parsedInfo.involvedAddresses,
        transactionType: parsedInfo.transactionType,
        transactionKind: parsedInfo.transactionKind,
        moduleName: parsedInfo.moduleName,
        functionName: parsedInfo.functionName,
        tokens: parsedInfo.tokens,
        balanceChanges: parsedInfo.balanceChanges,
        objectChanges: parsedInfo.objectChanges,
        status: parsedInfo.status,
        errorMessage: parsedInfo.errorMessage,
        gasUsed: parsedInfo.gasUsed,
        gasCost: parsedInfo.gasCost,
        summary,
        network,
      });

      // 保存到数据库
      const result = await this.parsedTransactionRepository.save(parsedTransaction);
      
      this.logger.log(`✅ 解析交易已保存: ${txResponse.digest} - ${summary}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ 解析并保存交易失败: ${txResponse.digest}`, error);
      throw error;
    }
  }

  /**
   * 根据交易哈希查找
   */
  async findByDigest(digest: string): Promise<ParsedTransaction | null> {
    return await this.parsedTransactionRepository.findOne({
      where: { digest }
    });
  }

  /**
   * 根据区块号查找
   */
  async findByBlockNumber(blockNumber: number): Promise<ParsedTransaction[]> {
    return await this.parsedTransactionRepository.find({
      where: { blockNumber },
      order: { timestamp: 'ASC' }
    });
  }

  /**
   * 根据发送者地址查找
   */
  async findBySender(sender: string, limit: number = 50): Promise<ParsedTransaction[]> {
    return await this.parsedTransactionRepository.find({
      where: { sender },
      order: { timestamp: 'DESC' },
      take: limit
    });
  }

  /**
   * 根据接收者地址查找
   */
  async findByRecipient(recipient: string, limit: number = 50): Promise<ParsedTransaction[]> {
    return await this.parsedTransactionRepository
      .createQueryBuilder('pt')
      .where(':recipient = ANY(pt.recipients)', { recipient })
      .orderBy('pt.timestamp', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * 根据交易类型查找
   */
  async findByTransactionType(transactionType: string, limit: number = 50): Promise<ParsedTransaction[]> {
    return await this.parsedTransactionRepository.find({
      where: { transactionType },
      order: { timestamp: 'DESC' },
      take: limit
    });
  }

  /**
   * 根据代币类型查找
   */
  async findByToken(coinType: string, limit: number = 50): Promise<ParsedTransaction[]> {
    return await this.parsedTransactionRepository
      .createQueryBuilder('pt')
      .where('pt.tokens @> :token', { token: JSON.stringify([{ coinType }]) })
      .orderBy('pt.timestamp', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * 获取最新解析交易
   */
  async getLatest(limit: number = 10): Promise<ParsedTransaction[]> {
    return await this.parsedTransactionRepository.find({
      order: { timestamp: 'DESC' },
      take: limit
    });
  }

  /**
   * 统计解析交易数量
   */
  async count(): Promise<number> {
    return await this.parsedTransactionRepository.count();
  }

  /**
   * 根据时间范围查询
   */
  async findByTimeRange(startTime: Date, endTime: Date): Promise<ParsedTransaction[]> {
    return await this.parsedTransactionRepository.find({
      where: {
        timestamp: {
          $gte: startTime,
          $lte: endTime
        } as any
      },
      order: { timestamp: 'ASC' }
    });
  }

  /**
   * 获取交易统计信息
   */
  async getStatistics() {
    const total = await this.count();
    const latest = await this.getLatest(1);
    const latestTimestamp = latest.length > 0 ? latest[0].timestamp : null;

    // 按交易类型统计
    const typeStats = await this.parsedTransactionRepository
      .createQueryBuilder('pt')
      .select('pt.transactionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('pt.transactionType')
      .getRawMany();

    // 按状态统计
    const statusStats = await this.parsedTransactionRepository
      .createQueryBuilder('pt')
      .select('pt.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('pt.status')
      .getRawMany();

    return {
      total,
      latestTimestamp,
      typeStats,
      statusStats,
    };
  }

  /**
   * 获取所有交易类型
   */
  async getTransactionTypes(): Promise<Array<{type: string, count: number}>> {
    const typeStats = await this.parsedTransactionRepository
      .createQueryBuilder('pt')
      .select('pt.transactionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('pt.transactionType')
      .orderBy('count', 'DESC')
      .getRawMany();

    return typeStats.map(stat => ({
      type: stat.type,
      count: parseInt(stat.count)
    }));
  }

  /**
   * 获取钱包活动统计
   */
  async getWalletActivityStats(address: string) {
    // 作为发送者的交易
    const asSender = await this.parsedTransactionRepository.count({
      where: { sender: address }
    });

    // 作为接收者的交易
    const asRecipient = await this.parsedTransactionRepository
      .createQueryBuilder('pt')
      .where(':address = ANY(pt.recipients)', { address })
      .getCount();

    // 涉及的交易总数
    const involved = await this.parsedTransactionRepository
      .createQueryBuilder('pt')
      .where(':address = ANY(pt.involvedAddresses)', { address })
      .getCount();

    return {
      asSender,
      asRecipient,
      involved,
    };
  }

  /**
   * 获取代币活动统计
   */
  async getTokenActivityStats(coinType: string) {
    const transactions = await this.findByToken(coinType, 1000);
    
    let totalVolume = 0n;
    const uniqueAddresses = new Set<string>();
    
    transactions.forEach(tx => {
      if (tx.balanceChanges) {
        tx.balanceChanges.forEach(change => {
          if (change.coinType === coinType) {
            totalVolume += BigInt(change.amount);
            uniqueAddresses.add(change.owner);
          }
        });
      }
    });

    return {
      transactionCount: transactions.length,
      totalVolume: totalVolume.toString(),
      uniqueAddresses: uniqueAddresses.size,
    };
  }

  /**
   * 删除旧的解析交易记录
   */
  async deleteOldRecords(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.parsedTransactionRepository.delete({
      timestamp: {
        $lt: cutoffDate
      } as any
    });

    this.logger.log(`🗑️ 删除了 ${result.affected} 条旧的解析交易记录`);
    return result.affected || 0;
  }
} 