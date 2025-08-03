import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface LogConfig {
  serviceName: string;
  logDir: string;
  logLevel: string;
}

export class FileLogger implements LoggerService {
  private logStream: fs.WriteStream;
  private logDir: string;
  private serviceName: string;

  constructor(config: LogConfig) {
    this.serviceName = config.serviceName;
    this.logDir = config.logDir;
    
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // 创建日志文件路径
    const logFileName = `${this.serviceName}-${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(this.logDir, logFileName);

    // 创建写入流
    this.logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  }

  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} [${this.serviceName}] ${level} ${contextStr} ${message}\n`;
  }

  private writeLog(level: string, message: string, context?: string): void {
    const formattedMessage = this.formatMessage(level, message, context);
    this.logStream.write(formattedMessage);
    
    // 同时输出到控制台
    console.log(formattedMessage.trim());
  }

  log(message: string, context?: string): void {
    this.writeLog('INFO', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.writeLog('ERROR', message, context);
    if (trace) {
      this.writeLog('ERROR', `Trace: ${trace}`, context);
    }
  }

  warn(message: string, context?: string): void {
    this.writeLog('WARN', message, context);
  }

  debug(message: string, context?: string): void {
    this.writeLog('DEBUG', message, context);
  }

  verbose(message: string, context?: string): void {
    this.writeLog('VERBOSE', message, context);
  }

  // 记录请求信息
  logRequest(method: string, url: string, body?: any, context?: string): void {
    const requestInfo = {
      method,
      url,
      body: body ? JSON.stringify(body) : undefined,
      timestamp: new Date().toISOString()
    };
    this.writeLog('REQUEST', JSON.stringify(requestInfo), context);
  }

  // 记录响应信息
  logResponse(statusCode: number, response: any, context?: string): void {
    const responseInfo = {
      statusCode,
      response: typeof response === 'string' ? response : JSON.stringify(response),
      timestamp: new Date().toISOString()
    };
    this.writeLog('RESPONSE', JSON.stringify(responseInfo), context);
  }

  // 记录微服务消息
  logMicroserviceMessage(pattern: string, data: any, context?: string): void {
    const messageInfo = {
      pattern,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    };
    this.writeLog('MICROSERVICE', JSON.stringify(messageInfo), context);
  }

  // 关闭日志流
  close(): void {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

// 创建日志配置
export function createLoggerConfig(serviceName: string): LogConfig {
  return {
    serviceName,
    logDir: path.join(process.cwd(), 'logs', serviceName),
    logLevel: process.env.LOG_LEVEL || 'info'
  };
} 