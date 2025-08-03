import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MonitorService } from './monitor.service';
import { NetworkConfig } from '../config/network.config';
import { MONITOR_PATTERNS } from '../microservices/patterns';

@Controller('monitor')
export class MonitorController {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly networkConfig: NetworkConfig,
  ) {}

  @Get('status')
  async getStatus() {
    return await this.monitorService.getScannerStatus();
  }

  @Post('start')
  async startScanning() {
    await this.monitorService.startScanning();
    return { message: '扫描已启动' };
  }

  @Post('stop')
  async stopScanning() {
    await this.monitorService.stopScanning();
    return { message: '扫描已停止' };
  }

  @Post('reset')
  async resetScanner() {
    await this.monitorService.resetScanner();
    return { message: '扫描器已重置' };
  }

  @Get('test-connection')
  async testConnection() {
    return await this.monitorService.testSuiConnection();
  }

  @Get('network')
  async getNetworkInfo() {
    return this.networkConfig.getCurrentNetwork();
  }

  @Get('networks')
  async getAllNetworks() {
    return {
      networks: this.networkConfig.getAllNetworks(),
      current: this.networkConfig.getCurrentNetwork()
    };
  }

  @Get('network-info')
  async getFullNetworkInfo() {
    return this.networkConfig.getNetworkInfo();
  }

  @Get('network/:name')
  async getNetwork(@Param('name') name: string) {
    const network = this.networkConfig.getNetwork(name);
    if (!network) {
      return { error: '网络不存在' };
    }
    return network;
  }

  // 微服务消息处理器
  @MessagePattern(MONITOR_PATTERNS.GET_STATUS)
  async getStatusMicroservice() {
    return await this.monitorService.getScannerStatus();
  }

  @MessagePattern(MONITOR_PATTERNS.START_MONITORING)
  async startMonitoringMicroservice() {
    await this.monitorService.startScanning();
    return { message: '扫描已启动' };
  }

  @MessagePattern(MONITOR_PATTERNS.STOP_MONITORING)
  async stopMonitoringMicroservice() {
    await this.monitorService.stopScanning();
    return { message: '扫描已停止' };
  }

  @MessagePattern(MONITOR_PATTERNS.RESET_MONITORING)
  async resetMonitoringMicroservice() {
    await this.monitorService.resetScanner();
    return { message: '扫描器已重置' };
  }

  @MessagePattern(MONITOR_PATTERNS.TEST_CONNECTION)
  async testConnectionMicroservice() {
    return await this.monitorService.testSuiConnection();
  }

  @MessagePattern(MONITOR_PATTERNS.GET_NETWORK_INFO)
  async getNetworkInfoMicroservice() {
    return this.networkConfig.getCurrentNetwork();
  }

  @MessagePattern(MONITOR_PATTERNS.GET_NETWORKS)
  async getAllNetworksMicroservice() {
    return {
      networks: this.networkConfig.getAllNetworks(),
      current: this.networkConfig.getCurrentNetwork()
    };
  }

  @MessagePattern(MONITOR_PATTERNS.GET_NETWORK)
  async getNetworkMicroservice(@Payload() data: { name: string }) {
    const network = this.networkConfig.getNetwork(data.name);
    if (!network) {
      return { error: '网络不存在' };
    }
    return network;
  }
} 