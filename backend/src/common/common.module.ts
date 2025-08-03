import { Module } from '@nestjs/common';
import { SqlLoggerService } from './sql-logger.service';

@Module({
  providers: [SqlLoggerService],
  exports: [SqlLoggerService],
})
export class CommonModule {} 