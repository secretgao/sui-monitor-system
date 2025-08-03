import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionsModule } from './transactions/transactions.module';
import { BlocksModule } from './blocks/blocks.module';
import { TransactionResponsesModule } from './transaction-responses/transaction-responses.module';
import { ParsedTransactionsModule } from './parsed-transactions/parsed-transactions.module';
import { WalletsModule } from './wallets/wallets.module';
import { MonitorModule } from './monitor/monitor.module';
import { DatabaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    TransactionsModule,
    BlocksModule,
    TransactionResponsesModule,
    ParsedTransactionsModule,
    WalletsModule,
    MonitorModule,
    GatewayModule,
  ],
})
export class AppModule {} 