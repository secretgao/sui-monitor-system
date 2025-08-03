import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { BlocksMicroserviceModule } from './blocks.microservice.module';
import { microservicesConfig } from '../microservices/microservices.config';
import { FileLogger, createLoggerConfig } from '../common/logger.config';

async function bootstrap() {
  // 创建日志记录器
  const logger = new FileLogger(createLoggerConfig('block'));
  
  try {
    logger.log('🚀 启动 Block Microservice...');
    
    const app = await NestFactory.createMicroservice(BlocksMicroserviceModule, {
      transport: Transport.TCP,
      options: {
        host: microservicesConfig.block.options.host,
        port: microservicesConfig.block.options.port,
      },
      logger: logger,
    });

    await app.listen();
    logger.log(`✅ Block Microservice 启动成功，运行在端口 ${microservicesConfig.block.options.port}`);
    
    // 记录启动信息
    logger.log(`📊 服务配置:`, 'Bootstrap');
    logger.log(`   - 主机: ${microservicesConfig.block.options.host}`, 'Bootstrap');
    logger.log(`   - 端口: ${microservicesConfig.block.options.port}`, 'Bootstrap');
    logger.log(`   - 传输协议: TCP`, 'Bootstrap');
    
  } catch (error) {
    logger.error(`❌ Block Microservice 启动失败: ${error.message}`, error.stack, 'Bootstrap');
    throw error;
  }
}

bootstrap(); 