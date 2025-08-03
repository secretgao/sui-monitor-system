import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { MonitorMicroserviceModule } from './monitor.microservice.module';
import { microservicesConfig } from '../microservices/microservices.config';
import { FileLogger, createLoggerConfig } from '../common/logger.config';

async function bootstrap() {
  // 创建日志记录器
  const logger = new FileLogger(createLoggerConfig('monitor'));
  
  try {
    logger.log('🚀 启动 Monitor Microservice...');
    
    const app = await NestFactory.createMicroservice(MonitorMicroserviceModule, {
      transport: Transport.TCP,
      options: {
        host: microservicesConfig.monitor.options.host,
        port: microservicesConfig.monitor.options.port,
      },
      logger: logger,
    });

    await app.listen();
    logger.log(`✅ Monitor Microservice 启动成功，运行在端口 ${microservicesConfig.monitor.options.port}`);
    
    // 记录启动信息
    logger.log(`📊 服务配置:`, 'Bootstrap');
    logger.log(`   - 主机: ${microservicesConfig.monitor.options.host}`, 'Bootstrap');
    logger.log(`   - 端口: ${microservicesConfig.monitor.options.port}`, 'Bootstrap');
    logger.log(`   - 传输协议: TCP`, 'Bootstrap');
    
  } catch (error) {
    logger.error(`❌ Monitor Microservice 启动失败: ${error.message}`, error.stack, 'Bootstrap');
    throw error;
  }
}

bootstrap(); 