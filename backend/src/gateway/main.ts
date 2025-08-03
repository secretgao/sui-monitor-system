import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FileLogger, createLoggerConfig } from '../common/logger.config';

async function bootstrap() {
  // 创建日志记录器
  const logger = new FileLogger(createLoggerConfig('gateway'));
  
  try {
    logger.log('🚀 启动 API Gateway...');
    
    const app = await NestFactory.create(GatewayModule, {
      logger: logger,
    });

    // 启用CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // 全局验证管道
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    // 全局日志拦截器
    const { LoggingInterceptor } = await import('../common/logging.interceptor');
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger文档配置
    const config = new DocumentBuilder()
      .setTitle('Sui Chain Scanner - API Gateway')
      .setDescription('微服务架构的API网关')
      .setVersion('1.0')
      .addTag('API Gateway')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    const port = process.env.GATEWAY_PORT || 4000;
    await app.listen(port);
    
    logger.log(`✅ API Gateway 启动成功，运行在端口 ${port}`);
    logger.log(`📚 Swagger 文档地址: http://localhost:${port}/api-docs`);
    
    // 记录启动信息
    logger.log(`📊 服务配置:`, 'Bootstrap');
    logger.log(`   - 端口: ${port}`, 'Bootstrap');
    logger.log(`   - CORS: 已启用`, 'Bootstrap');
    logger.log(`   - 验证管道: 已启用`, 'Bootstrap');
    logger.log(`   - Swagger: 已启用`, 'Bootstrap');
    
  } catch (error) {
    logger.error(`❌ API Gateway 启动失败: ${error.message}`, error.stack, 'Bootstrap');
    throw error;
  }
}

bootstrap(); 