import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MonitorService } from './monitor.service';
import { MONITOR_PATTERNS } from '../microservices/patterns';

@Controller()
export class MonitorMicroserviceController {
  constructor(private readonly monitorService: MonitorService) {}

  @MessagePattern(MONITOR_PATTERNS.GET_STATUS)
  async getStatus() {
    return await this.monitorService.getStatus();
  }

  @MessagePattern(MONITOR_PATTERNS.START_MONITORING)
  async startMonitoring() {
    return await this.monitorService.startMonitoring();
  }

  @MessagePattern(MONITOR_PATTERNS.STOP_MONITORING)
  async stopMonitoring() {
    return await this.monitorService.stopMonitoring();
  }

  @MessagePattern(MONITOR_PATTERNS.RESET_MONITORING)
  async resetMonitoring() {
    return await this.monitorService.resetMonitoring();
  }

  @MessagePattern(MONITOR_PATTERNS.TEST_CONNECTION)
  async testConnection() {
    return await this.monitorService.testConnection();
  }

  @MessagePattern(MONITOR_PATTERNS.GET_NETWORK_INFO)
  async getNetworkInfo() {
    return await this.monitorService.getNetworkInfo();
  }

  @MessagePattern(MONITOR_PATTERNS.GET_NETWORKS)
  async getNetworks() {
    return await this.monitorService.getNetworks();
  }

  @MessagePattern(MONITOR_PATTERNS.GET_NETWORK)
  async getNetwork(@Payload() data: { name: string }) {
    return await this.monitorService.getNetwork(data.name);
  }
} 