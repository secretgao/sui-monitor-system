import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // 创建自定义logger
    const customLogger = {
      logQuery: (query: string, parameters?: any[]) => {
        this.logToFile('QUERY', query, parameters);
      },
      logQueryError: (error: string, query: string, parameters?: any[]) => {
        this.logToFile('ERROR', query, parameters, error);
      },
      logQuerySlow: (time: number, query: string, parameters?: any[]) => {
        this.logToFile('SLOW_QUERY', query, parameters, null, time);
      },
      logMigration: (message: string) => {
        this.logToFile('MIGRATION', message);
      },
      logSchemaBuild: (message: string) => {
        this.logToFile('SCHEMA_BUILD', message);
      },
      log: (level: 'log' | 'info' | 'warn', message: any) => {
        this.logToFile(level.toUpperCase(), message);
      }
    };

    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', ''),
      database: this.configService.get('DB_DATABASE', 'sui_monitor'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get('NODE_ENV') === 'development',
      logging: this.configService.get('NODE_ENV') === 'development' ? [
        'query',
        'error',
        'schema',
        'warn',
        'info',
        'log'
      ] : false,
      logger: this.configService.get('NODE_ENV') === 'development' ? customLogger : undefined,
              extra: {
          connectionLimit: 10,
        },
      ssl: this.configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  private logToFile(type: string, query?: string, parameters?: any[], error?: string, executionTime?: number) {
    try {
      // 创建logs目录
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // 创建日志文件
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(logDir, `sql-${today}.log`);
      
      // 安全地处理参数，避免Unicode问题
      const safeParameters = parameters ? parameters.map(param => {
        if (typeof param === 'string') {
          // 清理字符串中的Unicode转义序列
          return param.replace(/\\u[0-9a-fA-F]{4}/g, '');
        }
        return param;
      }) : [];
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        type,
        query: query || '',
        parameters: safeParameters,
        error: error || '',
        executionTime: executionTime || 0
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(logFile, logLine, 'utf8');
    } catch (err) {
      console.error('写入SQL日志失败:', err);
    }
  }
} 