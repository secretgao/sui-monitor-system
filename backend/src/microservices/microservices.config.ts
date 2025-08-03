import { Transport } from '@nestjs/microservices';

export const microservicesConfig = {
  // API Gateway 配置
  gateway: {
    port: 4000,
  },

  // Monitor Service 配置
  monitor: {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4001,
    },
  },

  // Transaction Service 配置
  transaction: {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4002,
    },
  },

  // Wallet Service 配置
  wallet: {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4003,
    },
  },

  // Block Service 配置
  block: {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4004,
    },
  },
}; 