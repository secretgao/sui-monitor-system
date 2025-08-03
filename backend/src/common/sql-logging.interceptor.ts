import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SqlLoggerService } from './sql-logger.service';

@Injectable()
export class SqlLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SqlLoggingInterceptor.name);

  constructor(private sqlLogger: SqlLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // 记录请求开始
    this.logger.log(`${method} ${url} - 开始处理`);

    return next.handle().pipe(
      tap(() => {
        // 记录请求完成
        this.logger.log(`${method} ${url} - 完成处理`);
      }),
    );
  }
} 