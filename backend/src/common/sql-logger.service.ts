import { Injectable, Logger } from '@nestjs/common';
import { Logger as TypeOrmLogger } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SqlLoggerService implements TypeOrmLogger {
  private readonly logger = new Logger(SqlLoggerService.name);
  private logStream: fs.WriteStream;
  private logDir: string;
  private logFile: string;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger() {
    try {
      // 创建logs目录
      this.logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      // 创建SQL日志文件，按日期命名
      const today = new Date().toISOString().split('T')[0];
      this.logFile = path.join(this.logDir, `sql-${today}.log`);
      
      // 创建写入流
      this.logStream = fs.createWriteStream(this.logFile, { 
        flags: 'a', // 追加模式
        encoding: 'utf8'
      });

      this.logger.log(`SQL日志文件已初始化: ${this.logFile}`);
    } catch (error) {
      this.logger.error('初始化SQL日志文件失败:', error);
    }
  }

  logQueryToFile(query: string, parameters?: any[]) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: 'QUERY',
      query,
      parameters: parameters || []
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      this.logStream.write(logLine);
    } catch (error) {
      this.logger.error('写入SQL日志失败:', error);
    }
  }

  logQueryErrorToFile(error: string, query?: string, parameters?: any[]) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: 'ERROR',
      error,
      query: query || '',
      parameters: parameters || []
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      this.logStream.write(logLine);
    } catch (error) {
      this.logger.error('写入SQL错误日志失败:', error);
    }
  }

  logQuerySlowToFile(time: number, query: string, parameters?: any[]) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: 'SLOW_QUERY',
      executionTime: time,
      query,
      parameters: parameters || []
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      this.logStream.write(logLine);
    } catch (error) {
      this.logger.error('写入慢查询日志失败:', error);
    }
  }

  // TypeORM Logger 接口实现
  logQuery(query: string, parameters?: any[], queryRunner?: any) {
    this.logQueryToFile(query, parameters);
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: any) {
    this.logQueryErrorToFile(error, query, parameters);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: any) {
    this.logQuerySlowToFile(time, query, parameters);
  }

  logMigration(message: string, queryRunner?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: 'MIGRATION',
      message
    };
    const logLine = JSON.stringify(logEntry) + '\n';
    try {
      this.logStream.write(logLine);
    } catch (error) {
      this.logger.error('写入迁移日志失败:', error);
    }
  }

  logSchemaBuild(message: string, queryRunner?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: 'SCHEMA_BUILD',
      message
    };
    const logLine = JSON.stringify(logEntry) + '\n';
    try {
      this.logStream.write(logLine);
    } catch (error) {
      this.logger.error('写入Schema构建日志失败:', error);
    }
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: level.toUpperCase(),
      message: typeof message === 'string' ? message : JSON.stringify(message)
    };
    const logLine = JSON.stringify(logEntry) + '\n';
    try {
      this.logStream.write(logLine);
    } catch (error) {
      this.logger.error(`写入${level}日志失败:`, error);
    }
  }

  onModuleDestroy() {
    if (this.logStream) {
      this.logStream.end();
      this.logger.log('SQL日志流已关闭');
    }
  }
} 