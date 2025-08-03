import { Module } from '@nestjs/common';
import { NetworkConfig } from './network.config';

@Module({
  providers: [NetworkConfig],
  exports: [NetworkConfig],
})
export class ConfigModule {} 