import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SuiNetworkConfig {
  name: string;
  displayName: string;
  rpcUrl: string;
  wsUrl: string;
  description: string;
}

@Injectable()
export class NetworkConfig {
  private readonly networks: Record<string, SuiNetworkConfig> = {
    mainnet: {
      name: 'mainnet',
      displayName: '主网 (Mainnet)',
      rpcUrl: 'https://fullnode.mainnet.sui.io:443',
      wsUrl: 'wss://fullnode.mainnet.sui.io:443',
      description: 'Sui主网，生产环境'
    },
    testnet: {
      name: 'testnet',
      displayName: '测试网 (Testnet)',
      rpcUrl: 'https://fullnode.testnet.sui.io:443',
      wsUrl: 'wss://fullnode.testnet.sui.io:443',
      description: 'Sui测试网，用于测试'
    },
    devnet: {
      name: 'devnet',
      displayName: '开发网 (Devnet)',
      rpcUrl: 'https://fullnode.devnet.sui.io:443',
      wsUrl: 'wss://fullnode.devnet.sui.io:443',
      description: 'Sui开发网，用于开发'
    }
  };

  constructor(private configService: ConfigService) {}

  /**
   * 获取当前网络配置
   */
  getCurrentNetwork(): SuiNetworkConfig {
    const networkName = this.configService.get('SUI_NETWORK', 'mainnet').toLowerCase();
    
    // 检查是否在预定义网络中
    if (this.networks[networkName]) {
      const network = this.networks[networkName];
      
      // 使用环境变量中的URL（如果设置了）
      const customRpcUrl = this.configService.get(`SUI_${networkName.toUpperCase()}_RPC_URL`);
      const customWsUrl = this.configService.get(`SUI_${networkName.toUpperCase()}_WS_URL`);
      
      return {
        ...network,
        rpcUrl: customRpcUrl || network.rpcUrl,
        wsUrl: customWsUrl || network.wsUrl
      };
    }

    // 兼容性配置
    const fallbackRpcUrl = this.configService.get('SUI_RPC_URL');
    const fallbackWsUrl = this.configService.get('SUI_WS_URL');
    
    if (fallbackRpcUrl) {
      return {
        name: networkName,
        displayName: `自定义网络 (${networkName})`,
        rpcUrl: fallbackRpcUrl,
        wsUrl: fallbackWsUrl || 'wss://fullnode.mainnet.sui.io:443',
        description: '使用自定义RPC配置'
      };
    }

    // 默认返回主网
    return this.networks.mainnet;
  }

  /**
   * 获取所有可用网络
   */
  getAllNetworks(): SuiNetworkConfig[] {
    return Object.values(this.networks);
  }

  /**
   * 获取指定网络配置
   */
  getNetwork(networkName: string): SuiNetworkConfig | null {
    return this.networks[networkName.toLowerCase()] || null;
  }

  /**
   * 验证网络配置
   */
  validateNetwork(networkName: string): boolean {
    return networkName.toLowerCase() in this.networks;
  }

  /**
   * 获取网络状态信息
   */
  getNetworkInfo() {
    const currentNetwork = this.getCurrentNetwork();
    return {
      current: currentNetwork,
      available: this.getAllNetworks(),
      environment: this.configService.get('NODE_ENV', 'development')
    };
  }
} 