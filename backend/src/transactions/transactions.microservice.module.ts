import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { ParsedTransaction } from '../entities/parsed-transaction.entity';
import { ParsedTransactionsController } from '../parsed-transactions/parsed-transactions.controller';
import { ParsedTransactionsService } from '../parsed-transactions/parsed-transactions.service';
import { TransactionParserService } from '../transaction-responses/transaction-parser.service';
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
    TypeOrmModule.forFeature([Transaction, ParsedTransaction]),
  ],
  controllers: [TransactionsController, ParsedTransactionsController],
  providers: [
    TransactionsService, 
    ParsedTransactionsService, 
    TransactionParserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MicroserviceLoggingInterceptor,
    },
  ],
  exports: [TransactionsService, ParsedTransactionsService, TransactionParserService],
})
export class TransactionsMicroserviceModule {}