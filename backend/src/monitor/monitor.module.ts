import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';
import { MonitorMicroserviceController } from './monitor.microservice';
import { TransactionsModule } from '../transactions/transactions.module';
import { BlocksModule } from '../blocks/blocks.module';
import { TransactionResponsesModule } from '../transaction-responses/transaction-responses.module';
import { ParsedTransactionsModule } from '../parsed-transactions/parsed-transactions.module';
import { WalletsModule } from '../wallets/wallets.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [TransactionsModule, BlocksModule, TransactionResponsesModule, ParsedTransactionsModule, WalletsModule, ConfigModule],
  controllers: [MonitorController, MonitorMicroserviceController],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}