import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 设置详细的日志格式
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });



  // 启用CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // 只允许前端3000端口
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('Sui链监控API')
    .setDescription('Sui Move链交易监控系统API文档')
    .setVersion('1.0')
    .addTag('transactions')
    .addTag('blocks')
    .addTag('monitor')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 注意：这是旧的单体应用入口，现在推荐使用微服务架构
  // 微服务架构使用 start-microservices.sh 启动
  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  // 显示应用启动信息
  logger.log('='.repeat(60));
  logger.log(`🚀 Sui链监控应用已启动`);
  logger.log(`🌐 端口: ${port}`);
  logger.log(`📚 API文档: http://localhost:${port}/api`);
  logger.log(`🔍 监控状态: http://localhost:${port}/monitor/status`);
  logger.log(`🌐 网络信息: http://localhost:${port}/monitor/network`);
  logger.log('='.repeat(60));
}

bootstrap(); 