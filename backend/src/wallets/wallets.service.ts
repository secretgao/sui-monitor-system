import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletAsset } from '../entities/wallet-asset.entity';
import { ParsedTransaction } from '../entities/parsed-transaction.entity';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletAsset)
    private walletAssetRepository: Repository<WalletAsset>,
    @InjectRepository(ParsedTransaction)
    private parsedTransactionRepository: Repository<ParsedTransaction>,
  ) {}

  /**
   * 处理交易中的钱包地址
   */
  async processTransactionWallets(transaction: ParsedTransaction): Promise<void> {
    try {
      const addresses = new Set<string>();
      
      // 收集所有相关地址
      if (transaction.sender) addresses.add(transaction.sender);
      if (transaction.recipients && Array.isArray(transaction.recipients)) {
        transaction.recipients.forEach(addr => {
          if (addr && typeof addr === 'string') {
            addresses.add(addr);
          }
        });
      }
      if (transaction.involvedAddresses && Array.isArray(transaction.involvedAddresses)) {
        transaction.involvedAddresses.forEach(addr => {
          if (addr && typeof addr === 'string') {
            addresses.add(addr);
          }
        });
      }

      // 处理每个地址
      for (const address of addresses) {
        try {
          await this.upsertWallet(address, transaction.timestamp);
        } catch (walletError) {
          this.logger.error(`处理钱包地址失败: ${address}`, walletError);
          // 继续处理其他地址
        }
      }

      this.logger.log(`✅ 处理交易钱包地址完成: ${transaction.digest} (${addresses.size} 个地址)`);
    } catch (error) {
      this.logger.error(`❌ 处理交易钱包地址失败: ${transaction.digest}`, error);
    }
  }

  /**
   * 更新或创建钱包记录
   */
  async upsertWallet(address: string, timestamp: Date): Promise<Wallet> {
    try {
      let wallet = await this.walletRepository.findOne({
        where: { address }
      });

      if (!wallet) {
        // 创建新钱包
        wallet = this.walletRepository.create({
          address,
          firstSeenAt: timestamp,
          lastSeenAt: timestamp,
          transactionCount: 0,
          sentTransactionCount: 0,
          receivedTransactionCount: 0,
        });
      } else {
        // 更新现有钱包
        wallet.lastSeenAt = timestamp;
      }

      // 暂时跳过复杂的统计查询，只更新基本信息
      // TODO: 修复统计查询的列名问题
      this.logger.log(`钱包记录已更新: ${address}`);

      return await this.walletRepository.save(wallet);
    } catch (error) {
      this.logger.error(`更新钱包记录失败: ${address}`, error);
      throw error;
    }
  }

  /**
   * 获取钱包交易统计
   */
  async getWalletTransactionStats(address: string) {
    try {
      // 作为发送者的交易
      const asSender = await this.parsedTransactionRepository.count({
        where: { sender: address }
      });

      // 作为接收者的交易 - 使用更简单的方法
      const asRecipient = await this.parsedTransactionRepository
        .createQueryBuilder('pt')
        .where("pt.recipients::text LIKE :address", { address: `%${address}%` })
        .getCount();

      // 涉及的交易总数 - 使用更简单的方法，修复列名
      const total = await this.parsedTransactionRepository
        .createQueryBuilder('pt')
        .where("pt.involvedaddresses::text LIKE :address", { address: `%${address}%` })
        .getCount();

      return {
        asSender,
        asRecipient,
        total,
      };
    } catch (error) {
      this.logger.error(`获取钱包交易统计失败: ${address}`, error);
      // 返回默认值
      return {
        asSender: 0,
        asRecipient: 0,
        total: 0,
      };
    }
  }

  /**
   * 更新钱包资产
   */
  async updateWalletAssets(walletAddress: string, assets: any[]): Promise<void> {
    try {
      // 删除现有资产记录
      await this.walletAssetRepository.delete({ walletAddress });

      // 插入新的资产记录
      for (const asset of assets) {
        const walletAsset = this.walletAssetRepository.create({
          walletAddress,
          coinType: asset.coinType,
          symbol: asset.symbol,
          name: asset.name,
          decimals: asset.decimals,
          balance: asset.balance,
          valueUsd: asset.valueUsd,
          priceUsd: asset.priceUsd,
          iconUrl: asset.iconUrl,
          metadata: asset.metadata,
          lastUpdatedAt: new Date(),
        });

        await this.walletAssetRepository.save(walletAsset);
      }

      // 更新钱包总价值
      const totalValue = assets.reduce((sum, asset) => sum + (asset.valueUsd || 0), 0);
      await this.walletRepository.update(
        { address: walletAddress },
        { totalValueUsd: totalValue }
      );

      this.logger.log(`✅ 更新钱包资产完成: ${walletAddress}`);
    } catch (error) {
      this.logger.error(`❌ 更新钱包资产失败: ${walletAddress}`, error);
    }
  }

  /**
   * 获取所有钱包
   */
  async getAllWallets(page: number = 1, limit: number = 20): Promise<{ wallets: Wallet[], total: number }> {
    const [wallets, total] = await this.walletRepository.findAndCount({
      order: { totalValueUsd: 'DESC', lastSeenAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { wallets, total };
  }

  /**
   * 根据地址获取钱包
   */
  async getWalletByAddress(address: string): Promise<Wallet | null> {
    return await this.walletRepository.findOne({
      where: { address }
    });
  }

  /**
   * 获取钱包资产
   */
  async getWalletAssets(walletAddress: string): Promise<WalletAsset[]> {
    return await this.walletAssetRepository.find({
      where: { walletAddress },
      order: { valueUsd: 'DESC' }
    });
  }

  /**
   * 获取钱包详情（包括资产）
   */
  async getWalletDetails(address: string): Promise<{ wallet: Wallet, assets: WalletAsset[] } | null> {
    const wallet = await this.getWalletByAddress(address);
    if (!wallet) return null;

    const assets = await this.getWalletAssets(address);
    return { wallet, assets };
  }

  /**
   * 搜索钱包
   */
  async searchWallets(query: string, limit: number = 20): Promise<Wallet[]> {
    return await this.walletRepository
      .createQueryBuilder('wallet')
      .where('wallet.address ILIKE :query OR wallet.label ILIKE :query', { query: `%${query}%` })
      .orderBy('wallet.totalValueUsd', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 获取钱包统计信息
   */
  async getWalletStats() {
    const totalWallets = await this.walletRepository.count();
    const totalAssets = await this.walletAssetRepository.count();
    const totalValue = await this.walletRepository
      .createQueryBuilder('wallet')
      .select('SUM(wallet.totalValueUsd)', 'total')
      .getRawOne();

    return {
      totalWallets,
      totalAssets,
      totalValueUsd: parseFloat(totalValue?.total || '0'),
    };
  }

  /**
   * 测试钱包功能
   */
  async testWalletFunctionality(): Promise<any> {
    try {
      // 测试创建钱包
      const testAddress = '0x' + '0'.repeat(64);
      const testWallet = await this.upsertWallet(testAddress, new Date());
      
      // 测试获取钱包
      const foundWallet = await this.getWalletByAddress(testAddress);
      
      // 测试获取统计
      const stats = await this.getWalletStats();
      
      // 清理测试数据
      await this.walletRepository.delete({ address: testAddress });
      
      return {
        success: true,
        testWallet: testWallet ? '创建成功' : '创建失败',
        foundWallet: foundWallet ? '查找成功' : '查找失败',
        stats: stats,
      };
    } catch (error) {
      this.logger.error('钱包功能测试失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
} 