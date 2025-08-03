import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { Wallet } from '../entities/wallet.entity';
import { WalletAsset } from '../entities/wallet-asset.entity';
import { ParsedTransaction } from '../entities/parsed-transaction.entity';
import { DatabaseConfig } from '../config/database.config';
import { MicroserviceLoggingInterceptor } from '../common/microservice-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    TypeOrmModule.forFeature([Wallet, WalletAsset, ParsedTransaction]),
  ],
  controllers: [WalletsController],
  providers: [
    WalletsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MicroserviceLoggingInterceptor,
    },
  ],
  exports: [WalletsService],
})
export class WalletsMicroserviceModule {} 