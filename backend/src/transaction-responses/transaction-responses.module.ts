import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionResponse } from '../entities/transaction-response.entity';
import { TransactionResponsesService } from './transaction-responses.service';
import { TransactionResponsesController } from './transaction-responses.controller';
import { TransactionParserService } from './transaction-parser.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionResponse])],
  controllers: [TransactionResponsesController],
  providers: [TransactionResponsesService, TransactionParserService],
  exports: [TransactionResponsesService, TransactionParserService],
})
export class TransactionResponsesModule {} 