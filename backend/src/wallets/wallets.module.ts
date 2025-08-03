import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { Wallet } from '../entities/wallet.entity';
import { WalletAsset } from '../entities/wallet-asset.entity';
import { ParsedTransaction } from '../entities/parsed-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletAsset, ParsedTransaction]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {} 