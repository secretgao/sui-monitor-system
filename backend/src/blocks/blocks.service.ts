import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Block } from '../entities/block.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  async findAll(page: number = 1, limit: number = 20): Promise<{ blocks: Block[]; total: number }> {
    const [blocks, total] = await this.blockRepository.findAndCount({
      order: { blockNumber: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { blocks, total };
  }

  async findByNumber(blockNumber: number): Promise<Block> {
    return this.blockRepository.findOne({ where: { blockNumber } });
  }

  async findByHash(blockHash: string): Promise<Block> {
    return this.blockRepository.findOne({ where: { blockHash } });
  }

  async findByDateRange(startDate: Date, endDate: Date, page: number = 1, limit: number = 20): Promise<{ blocks: Block[]; total: number }> {
    const [blocks, total] = await this.blockRepository.findAndCount({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { blockNumber: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { blocks, total };
  }

  async getBlockStats(): Promise<any> {
    const totalBlocks = await this.blockRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBlocks = await this.blockRepository.count({
      where: {
        timestamp: Between(today, tomorrow),
      },
    });

    const totalGasUsed = await this.blockRepository
      .createQueryBuilder('block')
      .select('SUM(block.totalGasUsed)', 'total')
      .getRawOne();

    const totalGasCost = await this.blockRepository
      .createQueryBuilder('block')
      .select('SUM(block.totalGasCost)', 'total')
      .getRawOne();

    return {
      totalBlocks,
      todayBlocks,
      totalGasUsed: parseFloat(totalGasUsed?.total || '0'),
      totalGasCost: parseFloat(totalGasCost?.total || '0'),
    };
  }

  async create(blockData: Partial<Block>): Promise<Block> {
    const block = this.blockRepository.create(blockData);
    return this.blockRepository.save(block);
  }

  async createMany(blocks: Partial<Block>[]): Promise<Block[]> {
    const createdBlocks = this.blockRepository.create(blocks);
    return this.blockRepository.save(createdBlocks);
  }

  async getLatestBlock(): Promise<Block> {
    return this.blockRepository.findOne({
      where: {},
      order: { blockNumber: 'DESC' },
    });
  }

  async count(): Promise<number> {
    return this.blockRepository.count();
  }
} 