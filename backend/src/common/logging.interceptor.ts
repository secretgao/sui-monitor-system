import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // 记录请求信息
    this.logger.log(`📥 收到请求: ${method} ${url}`, 'HTTP');
    this.logger.log(`👤 User-Agent: ${userAgent}`, 'HTTP');
    if (body && Object.keys(body).length > 0) {
      this.logger.log(`📦 请求体: ${JSON.stringify(body)}`, 'HTTP');
    }

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = response.statusCode;

        // 记录响应信息
        this.logger.log(`📤 响应完成: ${method} ${url} - ${statusCode} (${duration}ms)`, 'HTTP');
        if (data && typeof data === 'object') {
          // 只记录响应的基本信息，避免日志过大
          const responseSummary = this.summarizeResponse(data);
          this.logger.log(`📋 响应摘要: ${responseSummary}`, 'HTTP');
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = error.status || 500;

        // 记录错误信息
        this.logger.error(`❌ 请求失败: ${method} ${url} - ${statusCode} (${duration}ms)`, error.stack, 'HTTP');
        this.logger.error(`🔍 错误详情: ${error.message}`, 'HTTP');

        throw error;
      }),
    );
  }

  private summarizeResponse(data: any): string {
    if (Array.isArray(data)) {
      return `数组，长度: ${data.length}`;
    } else if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length <= 3) {
        return JSON.stringify(data);
      } else {
        return `对象，包含 ${keys.length} 个属性: ${keys.slice(0, 3).join(', ')}...`;
      }
    } else {
      return String(data);
    }
  }
} 