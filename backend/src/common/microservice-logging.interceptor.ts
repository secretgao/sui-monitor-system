import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class MicroserviceLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Microservice');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const pattern = context.switchToRpc().getData();
    const startTime = Date.now();

    // 记录接收到的消息
    this.logger.log(`📨 收到微服务消息: ${pattern.pattern || 'unknown'}`, 'Microservice');
    if (pattern.data) {
      this.logger.log(`📦 消息数据: ${JSON.stringify(pattern.data)}`, 'Microservice');
    }

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录响应信息
        this.logger.log(`📤 消息处理完成: ${pattern.pattern || 'unknown'} (${duration}ms)`, 'Microservice');
        if (data && typeof data === 'object') {
          const responseSummary = this.summarizeResponse(data);
          this.logger.log(`📋 响应摘要: ${responseSummary}`, 'Microservice');
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录错误信息
        this.logger.error(`❌ 消息处理失败: ${pattern.pattern || 'unknown'} (${duration}ms)`, error.stack, 'Microservice');
        this.logger.error(`🔍 错误详情: ${error.message}`, 'Microservice');

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