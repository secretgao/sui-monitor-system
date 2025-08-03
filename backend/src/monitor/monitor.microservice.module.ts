import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MonitorController } from './monitor.controller';
import { MonitorMicroserviceController } from './monitor.microservice';
import { MonitorService } from './monitor.service';
import { TransactionsMicroserviceModule } from '../transactions/transactions.microservice.module';
import { BlocksModule } from '../blocks/blocks.module';
import { TransactionResponsesModule } from '../transaction-responses/transaction-responses.module';
import { ParsedTransactionsModule } from '../parsed-transactions/parsed-transactions.module';
import { WalletsModule } from '../wallets/wallets.module';
import { ConfigModule as AppConfigModule } from '../config/config.module';
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
    ScheduleModule.forRoot(),
    TransactionsMicroserviceModule,
    BlocksModule,
    TransactionResponsesModule,
    ParsedTransactionsModule,
    WalletsModule,
    AppConfigModule,
  ],
  controllers: [MonitorController, MonitorMicroserviceController],
  providers: [
    MonitorService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MicroserviceLoggingInterceptor,
    },
  ],
  exports: [MonitorService],
})
export class MonitorMicroserviceModule {} 