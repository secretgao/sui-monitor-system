import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { Block } from '../entities/block.entity';
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
    TypeOrmModule.forFeature([Block]),
  ],
  controllers: [BlocksController],
  providers: [
    BlocksService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MicroserviceLoggingInterceptor,
    },
  ],
  exports: [BlocksService],
})
export class BlocksMicroserviceModule {} 