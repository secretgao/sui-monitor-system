import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionResponse } from '../entities/transaction-response.entity';

@Injectable()
export class TransactionResponsesService {
  private readonly logger = new Logger(TransactionResponsesService.name);

  constructor(
    @InjectRepository(TransactionResponse)
    private transactionResponseRepository: Repository<TransactionResponse>,
  ) {}

  /**
   * 创建交易响应记录
   */
  async create(data: Partial<TransactionResponse>): Promise<TransactionResponse> {
    try {
      const transactionResponse = this.transactionResponseRepository.create(data);
      const result = await this.transactionResponseRepository.save(transactionResponse);
      this.logger.log(`✅ 交易响应记录已保存: ${data.digest}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ 保存交易响应记录失败: ${data.digest}`, error);
      throw error;
    }
  }

  /**
   * 批量创建交易响应记录
   */
  async createMany(data: Partial<TransactionResponse>[]): Promise<TransactionResponse[]> {
    try {
      const transactionResponses = this.transactionResponseRepository.create(data);
      const result = await this.transactionResponseRepository.save(transactionResponses);
      this.logger.log(`✅ 批量保存交易响应记录: ${result.length} 条`);
      return result;
    } catch (error) {
      this.logger.error(`❌ 批量保存交易响应记录失败`, error);
      throw error;
    }
  }

  /**
   * 根据交易哈希查找交易响应
   */
  async findByDigest(digest: string): Promise<TransactionResponse | null> {
    return await this.transactionResponseRepository.findOne({
      where: { digest }
    });
  }

  /**
   * 根据区块号查找交易响应
   */
  async findByBlockNumber(blockNumber: number): Promise<TransactionResponse[]> {
    return await this.transactionResponseRepository.find({
      where: { blockNumber },
      order: { timestamp: 'ASC' }
    });
  }

  /**
   * 获取最新的交易响应记录
   */
  async getLatest(limit: number = 10): Promise<TransactionResponse[]> {
    return await this.transactionResponseRepository.find({
      order: { timestamp: 'DESC' },
      take: limit
    });
  }

  /**
   * 统计交易响应数量
   */
  async count(): Promise<number> {
    return await this.transactionResponseRepository.count();
  }

  /**
   * 根据时间范围查询交易响应
   */
  async findByTimeRange(startTime: Date, endTime: Date): Promise<TransactionResponse[]> {
    return await this.transactionResponseRepository.find({
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
   * 删除旧的交易响应记录
   */
  async deleteOldRecords(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.transactionResponseRepository.delete({
      timestamp: {
        $lt: cutoffDate
      } as any
    });

    this.logger.log(`🗑️ 删除了 ${result.affected} 条旧的交易响应记录`);
    return result.affected || 0;
  }

  /**
   * 获取交易响应统计信息
   */
  async getStatistics() {
    const total = await this.count();
    const latest = await this.getLatest(1);
    const latestTimestamp = latest.length > 0 ? latest[0].timestamp : null;

    return {
      total,
      latestTimestamp,
      averagePerDay: await this.getAveragePerDay()
    };
  }

  /**
   * 计算每日平均交易响应数量
   */
  private async getAveragePerDay(): Promise<number> {
    const result = await this.transactionResponseRepository
      .createQueryBuilder('tr')
      .select('COUNT(*)', 'count')
      .addSelect('DATE(tr.timestamp)', 'date')
      .groupBy('DATE(tr.timestamp)')
      .getRawMany();

    if (result.length === 0) return 0;

    const totalCount = result.reduce((sum, row) => sum + parseInt(row.count), 0);
    return Math.round(totalCount / result.length);
  }
} 