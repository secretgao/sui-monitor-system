// 微服务客户端配置
const MICROSERVICE_CONFIG = {
  gateway: {
    host: process.env.NEXT_PUBLIC_GATEWAY_HOST || 'localhost',
    port: process.env.NEXT_PUBLIC_GATEWAY_PORT || 4000, // API Gateway端口
  },
  // 微服务配置（如果需要直接访问微服务）
  monitor: {
    host: process.env.NEXT_PUBLIC_MONITOR_HOST || 'localhost',
    port: process.env.NEXT_PUBLIC_MONITOR_PORT || 4001,
  },
  transaction: {
    host: process.env.NEXT_PUBLIC_TRANSACTION_HOST || 'localhost',
    port: process.env.NEXT_PUBLIC_TRANSACTION_PORT || 4002,
  },
  wallet: {
    host: process.env.NEXT_PUBLIC_WALLET_HOST || 'localhost',
    port: process.env.NEXT_PUBLIC_WALLET_PORT || 4003,
  },
  block: {
    host: process.env.NEXT_PUBLIC_BLOCK_HOST || 'localhost',
    port: process.env.NEXT_PUBLIC_BLOCK_PORT || 4004,
  },
};

// Gateway客户端（通过HTTP API）
class GatewayClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `http://${MICROSERVICE_CONFIG.gateway.host}:${MICROSERVICE_CONFIG.gateway.port}/api`;
  }

  // 通用请求方法
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Gateway请求失败: ${endpoint}`, error);
      throw error;
    }
  }

  // Monitor相关方法
  async getMonitorStatus() {
    return this.request('/monitor/status');
  }

  async startMonitoring() {
    return this.request('/monitor/start', { method: 'POST' });
  }

  async stopMonitoring() {
    return this.request('/monitor/stop', { method: 'POST' });
  }

  async resetMonitoring() {
    return this.request('/monitor/reset', { method: 'POST' });
  }

  async testConnection() {
    return this.request('/monitor/test-connection');
  }

  async getNetworkInfo() {
    return this.request('/monitor/network-info');
  }

  async getNetworks() {
    return this.request('/monitor/networks');
  }

  async getNetwork(name: string) {
    return this.request(`/monitor/network/${name}`);
  }

  // Transaction相关方法
  async getLatestTransactions(limit = 10) {
    return this.request(`/transactions/latest?limit=${limit}`);
  }

  async getTransactionByDigest(digest: string) {
    return this.request(`/transactions/digest/${digest}`);
  }

  async getTransactionsByBlock(blockNumber: number) {
    return this.request(`/transactions/block/${blockNumber}`);
  }

  async getTransactionsBySender(sender: string) {
    return this.request(`/transactions/sender/${sender}`);
  }

  async getTransactionCount() {
    return this.request('/transactions/count');
  }

  async getTransactionStatistics() {
    return this.request('/transactions/statistics');
  }

  // Parsed Transactions相关方法
  async getLatestParsedTransactions(limit = 10) {
    return this.request(`/parsed-transactions?limit=${limit}`);
  }

  async getParsedTransactionsByType(type: string) {
    return this.request(`/parsed-transactions/type/${type}`);
  }

  async getParsedTransactionStatistics() {
    return this.request('/parsed-transactions/statistics');
  }

  async getTransactionTypes() {
    return this.request('/parsed-transactions/types');
  }

  // Wallet相关方法
  async getWallets(page = 1, limit = 10) {
    return this.request(`/wallets?page=${page}&limit=${limit}`);
  }

  async getWalletDetails(address: string) {
    return this.request(`/wallets/${address}`);
  }

  async getWalletAssets(address: string) {
    return this.request(`/wallets/${address}/assets`);
  }

  async searchWallets(query: string) {
    return this.request(`/wallets/search/${query}`);
  }

  async getWalletStatistics() {
    return this.request('/wallets/statistics');
  }

  async testWalletFunctionality() {
    return this.request('/wallets/test');
  }

  // Block相关方法
  async getLatestBlocks(limit = 10) {
    return this.request(`/blocks/latest?limit=${limit}`);
  }

  async getBlockByNumber(blockNumber: number) {
    return this.request(`/blocks/${blockNumber}`);
  }

  async getBlockCount() {
    return this.request('/blocks/count');
  }

  async getBlockStatistics() {
    return this.request('/blocks/statistics');
  }
}

export const gatewayClient = new GatewayClient();

// 导出类型定义
export interface MicroserviceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// 工具函数
export const createMicroserviceResponse = <T>(
  success: boolean,
  data?: T,
  error?: string
): MicroserviceResponse<T> => ({
  success,
  data,
  error,
  timestamp: Date.now(),
}); 