import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(page: number = 1, limit: number = 20): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { transactions, total };
  }

  async findByDigest(digest: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ where: { digest } });
  }

  async findByAddress(address: string, page: number = 1, limit: number = 20): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: [
        { sender: address },
        { recipient: address },
      ],
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { transactions, total };
  }

  async findByDateRange(startDate: Date, endDate: Date, page: number = 1, limit: number = 20): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { transactions, total };
  }

  async findByTransactionType(transactionType: string, page: number = 1, limit: number = 20): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { transactionType },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { transactions, total };
  }

  async findByBlockNumber(blockNumber: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { blockNumber },
      order: { timestamp: 'DESC' },
    });
  }

  async findBySender(sender: string, limit: number = 50): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { sender },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getTransactionStats(): Promise<any> {
    const totalTransactions = await this.transactionRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = await this.transactionRepository.count({
      where: {
        timestamp: Between(today, tomorrow),
      },
    });

    const totalGasCost = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.gasCost)', 'total')
      .getRawOne();

    return {
      totalTransactions,
      todayTransactions,
      totalGasCost: parseFloat(totalGasCost?.total || '0'),
    };
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(transaction);
  }

  async createMany(transactions: Partial<Transaction>[]): Promise<Transaction[]> {
    const createdTransactions = this.transactionRepository.create(transactions);
    return this.transactionRepository.save(createdTransactions);
  }

  async count(): Promise<number> {
    return this.transactionRepository.count();
  }

  async getTransactionCount(): Promise<number> {
    return this.transactionRepository.count();
  }

  async getLatestTransactions(limit: number = 10): Promise<Transaction[]> {
    return this.transactionRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getTransactionByDigest(digest: string): Promise<Transaction> {
    return this.findByDigest(digest);
  }

  async getTransactionsByBlock(blockNumber: number): Promise<Transaction[]> {
    return this.findByBlockNumber(blockNumber);
  }

  async getTransactionsBySender(sender: string): Promise<Transaction[]> {
    return this.findBySender(sender);
  }

  async getTransactionStatistics(): Promise<any> {
    return this.getTransactionStats();
  }

  async getTransactionsByTimeRange(startTime: string, endTime: string): Promise<Transaction[]> {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    return this.transactionRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });
  }

  // Parsed Transaction 相关方法
  async getLatestParsedTransactions(limit: number = 10): Promise<any[]> {
    // 这里需要注入ParsedTransaction repository
    // 暂时返回空数组，后续可以扩展
    return [];
  }

  async getParsedTransactionByDigest(digest: string): Promise<any> {
    // 暂时返回null，后续可以扩展
    return null;
  }

  async getParsedTransactionsByType(type: string): Promise<any[]> {
    // 暂时返回空数组，后续可以扩展
    return [];
  }

  async getParsedTransactionStatistics(): Promise<any> {
    // 暂时返回空对象，后续可以扩展
    return {};
  }

  async getTransactionTypes(): Promise<string[]> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('DISTINCT transaction.transactionType', 'type')
      .where('transaction.transactionType IS NOT NULL')
      .getRawMany();
    
    return result.map(item => item.type);
  }
} 