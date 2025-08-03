import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParsedTransaction } from '../entities/parsed-transaction.entity';
import { ParsedTransactionsService } from './parsed-transactions.service';
import { ParsedTransactionsController } from './parsed-transactions.controller';
import { TransactionResponsesModule } from '../transaction-responses/transaction-responses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParsedTransaction]),
    TransactionResponsesModule, // 导入以使用TransactionParserService
  ],
  controllers: [ParsedTransactionsController],
  providers: [ParsedTransactionsService],
  exports: [ParsedTransactionsService],
})
export class ParsedTransactionsModule {} 