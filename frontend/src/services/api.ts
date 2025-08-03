// API服务层 - 封装所有后端接口调用

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// 通用API请求函数
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error(`API请求失败: ${endpoint}`, error);
    return { 
      error: error instanceof Error ? error.message : '未知错误', 
      success: false 
    };
  }
}

// ==================== 监控相关接口 ====================

export interface MonitorStatus {
  isScanning: boolean;
  lastProcessedBlock: number;
  currentBlock: number;
  network: string;
  uptime: string;
}

export interface NetworkInfo {
  name: string;
  displayName: string;
  rpcUrl: string;
  wsUrl: string;
  description: string;
}

export const monitorApi = {
  // 获取监控状态
  getStatus: () => apiRequest<MonitorStatus>('/monitor/status'),
  
  // 获取当前网络信息
  getNetwork: () => apiRequest<NetworkInfo>('/monitor/network'),
  
  // 获取完整网络信息（包括所有可用网络）
  getNetworkInfo: () => apiRequest<{current: NetworkInfo, available: NetworkInfo[], environment: string}>('/monitor/network-info'),
  
  // 获取所有网络
  getNetworks: () => apiRequest<{networks: NetworkInfo[], current: NetworkInfo}>('/monitor/networks'),
  
  // 获取特定网络信息
  getNetworkByName: (name: string) => apiRequest<NetworkInfo>(`/monitor/network/${name}`),
  
  // 启动监控
  startScanning: () => apiRequest('/monitor/start', { method: 'POST' }),
  
  // 停止监控
  stopScanning: () => apiRequest('/monitor/stop', { method: 'POST' }),
  
  // 重置监控
  resetScanner: () => apiRequest('/monitor/reset', { method: 'POST' }),
  
  // 测试连接
  testConnection: () => apiRequest('/monitor/test-connection'),
};

// ==================== 交易相关接口 ====================

export interface Transaction {
  id: number;
  digest: string;
  blockNumber: number;
  timestamp: string;
  sender: string;
  status: string;
  gasUsed: string;
  gasPrice: string;
  gasCost: number;
  transactionType: string;
  functionName: string;
  effects: any;
  events: any;
  arguments: any;
  createdAt: string;
  updatedAt: string;
}

export const transactionsApi = {
  // 获取最新交易
  getLatest: (limit: number = 10) => apiRequest<Transaction[]>(`/transactions?limit=${limit}`),
  
  // 根据交易哈希查询
  getByDigest: (digest: string) => apiRequest<Transaction>(`/transactions/digest/${digest}`),
  
  // 根据区块号查询
  getByBlockNumber: (blockNumber: number) => apiRequest<Transaction[]>(`/transactions/block/${blockNumber}`),
  
  // 根据发送者查询
  getBySender: (sender: string, limit: number = 50) => 
    apiRequest<Transaction[]>(`/transactions/sender/${sender}?limit=${limit}`),
  
  // 获取统计信息
  getStatistics: () => apiRequest('/transactions/statistics'),
  
  // 获取总数
  getCount: () => apiRequest<{ count: number }>('/transactions/count'),
  
  // 根据时间范围查询
  getByTimeRange: (startTime: string, endTime: string) => 
    apiRequest<Transaction[]>(`/transactions/time-range?startTime=${startTime}&endTime=${endTime}`),
};

// ==================== 区块相关接口 ====================

export interface Block {
  id: number;
  blockNumber: number;
  timestamp: string;
  transactionCount: number;
  totalGasCost: number;
  blockData: any;
  createdAt: string;
  updatedAt: string;
}

export const blocksApi = {
  // 获取最新区块
  getLatest: (limit: number = 10) => apiRequest<Block[]>(`/blocks?limit=${limit}`),
  
  // 根据区块号查询
  getByNumber: (blockNumber: number) => apiRequest<Block>(`/blocks/${blockNumber}`),
  
  // 获取统计信息
  getStatistics: () => apiRequest('/blocks/statistics'),
  
  // 获取总数
  getCount: () => apiRequest<{ count: number }>('/blocks/count'),
  
  // 根据时间范围查询
  getByTimeRange: (startTime: string, endTime: string) => 
    apiRequest<Block[]>(`/blocks/time-range?startTime=${startTime}&endTime=${endTime}`),
};

// ==================== 交易响应相关接口 ====================

export interface TransactionResponse {
  id: number;
  digest: string;
  blockNumber: number;
  timestamp: string;
  transaction: any;
  effects: any;
  events: any;
  objectChanges: any;
  balanceChanges: any;
  checkpoint: string;
  timestampMs: string;
  confirmedLocalExecution: boolean;
  rawResponse: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export const transactionResponsesApi = {
  // 获取最新交易响应
  getLatest: (limit: number = 10) => apiRequest<TransactionResponse[]>(`/transaction-responses?limit=${limit}`),
  
  // 根据交易哈希查询
  getByDigest: (digest: string) => apiRequest<TransactionResponse>(`/transaction-responses/digest/${digest}`),
  
  // 根据区块号查询
  getByBlockNumber: (blockNumber: number) => apiRequest<TransactionResponse[]>(`/transaction-responses/block/${blockNumber}`),
  
  // 获取统计信息
  getStatistics: () => apiRequest('/transaction-responses/statistics'),
  
  // 获取总数
  getCount: () => apiRequest<{ count: number }>('/transaction-responses/count'),
  
  // 根据时间范围查询
  getByTimeRange: (startTime: string, endTime: string) => 
    apiRequest<TransactionResponse[]>(`/transaction-responses/time-range?startTime=${startTime}&endTime=${endTime}`),
};

// ==================== 解析交易相关接口 ====================

export interface ParsedTransaction {
  id: number;
  digest: string;
  blockNumber: number;
  timestamp: string;
  sender: string;
  recipients: string[];
  involvedAddresses: string[];
  transactionType: string;
  transactionKind: string;
  moduleName?: string;
  functionName?: string;
  tokens: any[];
  balanceChanges: any[];
  objectChanges: any[];
  status: 'success' | 'failure';
  errorMessage?: string;
  gasUsed: string;
  gasCost: string;
  summary: string;
  network: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletStats {
  asSender: number;
  asRecipient: number;
  involved: number;
}

export interface TokenStats {
  transactionCount: number;
  totalVolume: string;
  uniqueAddresses: number;
}

export interface ParsedTransactionStats {
  total: number;
  latestTimestamp: string | null;
  typeStats: Array<{ type: string; count: string }>;
  statusStats: Array<{ status: string; count: string }>;
}

// ==================== 钱包相关接口 ====================

export interface Wallet {
  id: number;
  address: string;
  label?: string;
  description?: string;
  transactionCount: number;
  sentTransactionCount: number;
  receivedTransactionCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  totalValueUsd: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WalletAsset {
  id: number;
  walletAddress: string;
  coinType: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  balance: number;
  valueUsd?: number;
  priceUsd?: number;
  iconUrl?: string;
  metadata?: any;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletDetails {
  wallet: Wallet;
  assets: WalletAsset[];
}

export interface WalletStats {
  totalWallets: number;
  totalAssets: number;
  totalValueUsd: number;
}

export const walletsApi = {
  // 获取所有钱包
  getAll: (page: number = 1, limit: number = 20) => 
    apiRequest<{ wallets: Wallet[], total: number }>(`/wallets?page=${page}&limit=${limit}`),
  
  // 根据地址获取钱包
  getByAddress: (address: string) => apiRequest<Wallet>(`/wallets/address/${address}`),
  
  // 获取钱包详情（包括资产）
  getDetails: (address: string) => apiRequest<WalletDetails>(`/wallets/address/${address}/details`),
  
  // 获取钱包资产
  getAssets: (address: string) => apiRequest<WalletAsset[]>(`/wallets/address/${address}/assets`),
  
  // 搜索钱包
  search: (query: string, limit: number = 20) => 
    apiRequest<Wallet[]>(`/wallets/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  
  // 获取钱包统计
  getStats: () => apiRequest<WalletStats>('/wallets/statistics'),
};

export const parsedTransactionsApi = {
  // 获取最新解析交易
  getLatest: (limit: number = 10) => apiRequest<ParsedTransaction[]>(`/parsed-transactions?limit=${limit}`),
  
  // 根据交易哈希查询
  getByDigest: (digest: string) => apiRequest<ParsedTransaction>(`/parsed-transactions/digest/${digest}`),
  
  // 根据区块号查询
  getByBlockNumber: (blockNumber: number) => apiRequest<ParsedTransaction[]>(`/parsed-transactions/block/${blockNumber}`),
  
  // 根据发送者查询
  getBySender: (sender: string, limit: number = 50) => 
    apiRequest<ParsedTransaction[]>(`/parsed-transactions/sender/${sender}?limit=${limit}`),
  
  // 根据接收者查询
  getByRecipient: (recipient: string, limit: number = 50) => 
    apiRequest<ParsedTransaction[]>(`/parsed-transactions/recipient/${recipient}?limit=${limit}`),
  
  // 根据交易类型查询
  getByTransactionType: (transactionType: string, limit: number = 50) => 
    apiRequest<ParsedTransaction[]>(`/parsed-transactions/type/${encodeURIComponent(transactionType)}?limit=${limit}`),
  
  // 根据代币类型查询
  getByToken: (coinType: string, limit: number = 50) => 
    apiRequest<ParsedTransaction[]>(`/parsed-transactions/token/${encodeURIComponent(coinType)}?limit=${limit}`),
  
  // 获取统计信息
  getStatistics: () => apiRequest<ParsedTransactionStats>('/parsed-transactions/statistics'),
  
  // 获取所有交易类型
  getTransactionTypes: () => apiRequest<Array<{type: string, count: number}>>('/parsed-transactions/transaction-types'),
  
  // 获取总数
  getCount: () => apiRequest<{ count: number }>('/parsed-transactions/count'),
  
  // 根据时间范围查询
  getByTimeRange: (startTime: string, endTime: string) => 
    apiRequest<ParsedTransaction[]>(`/parsed-transactions/time-range?startTime=${startTime}&endTime=${endTime}`),
  
  // 获取钱包活动统计
  getWalletStats: (address: string) => apiRequest<WalletStats>(`/parsed-transactions/wallet/${address}/stats`),
  
  // 获取代币活动统计
  getTokenStats: (coinType: string) => apiRequest<TokenStats>(`/parsed-transactions/token/${encodeURIComponent(coinType)}/stats`),
  
  // 综合搜索
  search: (params: {
    address?: string;
    type?: string;
    token?: string;
    status?: 'success' | 'failure';
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return apiRequest<ParsedTransaction[]>(`/parsed-transactions/search?${searchParams.toString()}`);
  },
};

// ==================== 工具函数 ====================

export const utils = {
  // 格式化时间
  formatTime: (timestamp: string) => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleString('zh-CN');
    } catch (error) {
      return '时间格式错误';
    }
  },
  
  // 格式化地址（截断显示）
  formatAddress: (address: string, length: number = 8) => {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  },
  
  // 格式化代币数量
  formatTokenAmount: (amount: string, decimals: number = 9) => {
    if (!amount) return '0';
    try {
      const bigIntAmount = BigInt(amount);
      const divisor = BigInt(Math.pow(10, decimals));
      const wholePart = bigIntAmount / divisor;
      const fractionalPart = bigIntAmount % divisor;
      
      if (fractionalPart === BigInt(0)) {
        return wholePart.toString();
      }
      
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      return `${wholePart}.${fractionalStr}`;
    } catch (error) {
      return '0';
    }
  },
  
  // 安全格式化数字
  formatNumber: (value: any) => {
    if (value === null || value === undefined) return '0';
    try {
      const num = typeof value === 'string' ? parseInt(value) : Number(value);
      return isNaN(num) ? '0' : num.toLocaleString();
    } catch (error) {
      return '0';
    }
  },
  
  // 获取交易类型颜色
  getTransactionTypeColor: (type: string) => {
    const colorMap: Record<string, string> = {
      'SUI Transfer': 'text-blue-600',
      'Move Function Call': 'text-green-600',
      'Object Transfer': 'text-purple-600',
      'Payment': 'text-orange-600',
      'Module Publish': 'text-red-600',
      'Module Upgrade': 'text-yellow-600',
      'Batch Transaction': 'text-indigo-600',
    };
    return colorMap[type] || 'text-gray-600';
  },
  
  // 获取状态颜色
  getStatusColor: (status: string) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  },
};

export default {
  monitor: monitorApi,
  transactions: transactionsApi,
  blocks: blocksApi,
  transactionResponses: transactionResponsesApi,
  parsedTransactions: parsedTransactionsApi,
  utils,
}; 