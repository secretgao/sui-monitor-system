import { Injectable, Logger } from '@nestjs/common';

export interface ParsedTransactionInfo {
  digest: string;
  timestamp: Date;
  blockNumber: number;
  
  // 钱包地址信息
  sender: string;
  recipients: string[];
  involvedAddresses: string[];
  
  // 交易类型信息
  transactionType: string;
  transactionKind: string;
  moduleName?: string;
  functionName?: string;
  
  // 代币信息
  tokens: TokenInfo[];
  
  // 余额变化
  balanceChanges: BalanceChangeInfo[];
  
  // 对象变更
  objectChanges: ObjectChangeInfo[];
  
  // 交易状态
  status: 'success' | 'failure';
  errorMessage?: string;
  
  // Gas信息
  gasUsed: string;
  gasCost: string;
}

export interface TokenInfo {
  coinType: string;
  symbol: string;
  decimals: number;
  amount: string;
  owner: string;
}

export interface BalanceChangeInfo {
  owner: string;
  coinType: string;
  symbol: string;
  amount: string;
  changeType: 'increase' | 'decrease';
  previousBalance?: string;
  newBalance?: string;
}

export interface ObjectChangeInfo {
  type: 'created' | 'mutated' | 'deleted' | 'transferred' | 'wrapped' | 'unwrapped';
  objectId: string;
  objectType: string;
  sender?: string;
  recipient?: string;
  amount?: string;
  coinType?: string;
}

@Injectable()
export class TransactionParserService {
  private readonly logger = new Logger(TransactionParserService.name);

  /**
   * 解析交易响应数据
   */
  parseTransactionResponse(txResponse: any, blockNumber: number): ParsedTransactionInfo {
    try {
      const digest = txResponse.digest;
      const timestamp = new Date(parseInt(txResponse.timestampMs || '0'));
      
      // 解析基础信息
      const sender = this.extractSender(txResponse);
      const recipients = this.extractRecipients(txResponse);
      const involvedAddresses = this.extractInvolvedAddresses(txResponse);
      
      // 解析交易类型
      const transactionInfo = this.parseTransactionType(txResponse);
      
      // 解析代币信息
      const tokens = this.extractTokenInfo(txResponse);
      
      // 解析余额变化
      const balanceChanges = this.parseBalanceChanges(txResponse);
      
      // 解析对象变更
      const objectChanges = this.parseObjectChanges(txResponse);
      
      // 解析状态和Gas信息
      const status = this.parseStatus(txResponse);
      const gasInfo = this.parseGasInfo(txResponse);
      
      return {
        digest,
        timestamp,
        blockNumber,
        sender,
        recipients,
        involvedAddresses,
        transactionType: transactionInfo.transactionType,
        transactionKind: transactionInfo.transactionKind,
        moduleName: transactionInfo.moduleName,
        functionName: transactionInfo.functionName,
        tokens,
        balanceChanges,
        objectChanges,
        status: status.status,
        errorMessage: status.errorMessage,
        gasUsed: gasInfo.gasUsed,
        gasCost: gasInfo.gasCost,
      };
    } catch (error) {
      this.logger.error(`解析交易失败: ${txResponse.digest}`, error);
      throw error;
    }
  }

  /**
   * 提取发送者地址
   */
  private extractSender(txResponse: any): string {
    return txResponse.transaction?.data?.sender || 'unknown';
  }

  /**
   * 提取接收者地址
   */
  private extractRecipients(txResponse: any): string[] {
    const recipients = new Set<string>();
    
    // 从对象变更中提取接收者
    if (txResponse.objectChanges) {
      txResponse.objectChanges.forEach((change: any) => {
        if (change.recipient) {
          recipients.add(change.recipient);
        }
      });
    }
    
    // 从余额变更中提取接收者
    if (txResponse.balanceChanges) {
      txResponse.balanceChanges.forEach((change: any) => {
        if (change.owner?.AddressOwner) {
          recipients.add(change.owner.AddressOwner);
        }
      });
    }
    
    return Array.from(recipients);
  }

  /**
   * 提取所有涉及的地址
   */
  private extractInvolvedAddresses(txResponse: any): string[] {
    const addresses = new Set<string>();
    
    // 添加发送者
    const sender = this.extractSender(txResponse);
    if (sender !== 'unknown') {
      addresses.add(sender);
    }
    
    // 添加接收者
    const recipients = this.extractRecipients(txResponse);
    recipients.forEach(recipient => addresses.add(recipient));
    
    // 从事件中提取地址
    if (txResponse.events) {
      txResponse.events.forEach((event: any) => {
        if (event.sender) {
          addresses.add(event.sender);
        }
      });
    }
    
    return Array.from(addresses);
  }

  /**
   * 解析交易类型
   */
  private parseTransactionType(txResponse: any): {
    transactionType: string;
    transactionKind: string;
    moduleName?: string;
    functionName?: string;
  } {
    const transaction = txResponse.transaction?.data?.transaction;
    const kind = transaction?.kind || 'unknown';
    
    let transactionType = 'Unknown';
    let moduleName: string | undefined;
    let functionName: string | undefined;
    
    switch (kind) {
      case 'moveCall':
        transactionType = 'Move Function Call';
        const moveCall = transaction.data;
        moduleName = moveCall.module;
        functionName = moveCall.function;
        break;
        
      case 'transferObject':
        transactionType = 'Object Transfer';
        break;
        
      case 'transferSui':
        transactionType = 'SUI Transfer';
        break;
        
      case 'pay':
        transactionType = 'Payment';
        break;
        
      case 'paySui':
        transactionType = 'SUI Payment';
        break;
        
      case 'payAllSui':
        transactionType = 'Pay All SUI';
        break;
        
      case 'publish':
        transactionType = 'Module Publish';
        break;
        
      case 'upgrade':
        transactionType = 'Module Upgrade';
        break;
        
      case 'batch':
        transactionType = 'Batch Transaction';
        break;
        
      default:
        transactionType = `Unknown (${kind})`;
    }
    
    return {
      transactionType,
      transactionKind: kind,
      moduleName,
      functionName,
    };
  }

  /**
   * 提取代币信息
   */
  private extractTokenInfo(txResponse: any): TokenInfo[] {
    const tokens = new Map<string, TokenInfo>();
    
    // 从余额变更中提取代币信息
    if (txResponse.balanceChanges) {
      txResponse.balanceChanges.forEach((change: any) => {
        const coinType = change.coinType;
        const owner = change.owner?.AddressOwner || change.owner?.ObjectOwner || 'unknown';
        
        if (!tokens.has(coinType)) {
          const symbol = this.getTokenSymbol(coinType);
          const decimals = this.getTokenDecimals(coinType);
          
          tokens.set(coinType, {
            coinType,
            symbol,
            decimals,
            amount: '0',
            owner,
          });
        }
      });
    }
    
    // 从对象变更中提取代币信息
    if (txResponse.objectChanges) {
      txResponse.objectChanges.forEach((change: any) => {
        if (change.coinType) {
          const coinType = change.coinType;
          const owner = change.owner || 'unknown';
          
          if (!tokens.has(coinType)) {
            const symbol = this.getTokenSymbol(coinType);
            const decimals = this.getTokenDecimals(coinType);
            
            tokens.set(coinType, {
              coinType,
              symbol,
              decimals,
              amount: change.amount || '0',
              owner,
            });
          }
        }
      });
    }
    
    return Array.from(tokens.values());
  }

  /**
   * 解析余额变化
   */
  private parseBalanceChanges(txResponse: any): BalanceChangeInfo[] {
    const balanceChanges: BalanceChangeInfo[] = [];
    
    if (txResponse.balanceChanges) {
      txResponse.balanceChanges.forEach((change: any) => {
        const owner = change.owner?.AddressOwner || change.owner?.ObjectOwner || 'unknown';
        const coinType = change.coinType;
        const amount = change.amount;
        const symbol = this.getTokenSymbol(coinType);
        
        const changeType = BigInt(amount) > 0n ? 'increase' : 'decrease';
        
        balanceChanges.push({
          owner,
          coinType,
          symbol,
          amount: Math.abs(Number(amount)).toString(),
          changeType,
        });
      });
    }
    
    return balanceChanges;
  }

  /**
   * 解析对象变更
   */
  private parseObjectChanges(txResponse: any): ObjectChangeInfo[] {
    const objectChanges: ObjectChangeInfo[] = [];
    
    if (txResponse.objectChanges) {
      txResponse.objectChanges.forEach((change: any) => {
        objectChanges.push({
          type: change.type,
          objectId: change.objectId,
          objectType: change.objectType,
          sender: change.sender,
          recipient: change.recipient,
          amount: change.amount,
          coinType: change.coinType,
        });
      });
    }
    
    return objectChanges;
  }

  /**
   * 解析交易状态
   */
  private parseStatus(txResponse: any): {
    status: 'success' | 'failure';
    errorMessage?: string;
  } {
    const effects = txResponse.effects;
    const status = effects?.status?.status || 'unknown';
    const errorMessage = effects?.status?.error;
    
    return {
      status: status === 'success' ? 'success' : 'failure',
      errorMessage,
    };
  }

  /**
   * 解析Gas信息
   */
  private parseGasInfo(txResponse: any): {
    gasUsed: string;
    gasCost: string;
  } {
    const effects = txResponse.effects;
    const gasUsed = effects?.gasUsed;
    
    const computationCost = gasUsed?.computationCost || '0';
    const storageCost = gasUsed?.storageCost || '0';
    const totalGasUsed = (BigInt(computationCost) + BigInt(storageCost)).toString();
    
    const gasCost = effects?.gasCost || '0';
    
    return {
      gasUsed: totalGasUsed,
      gasCost,
    };
  }

  /**
   * 获取代币符号
   */
  private getTokenSymbol(coinType: string): string {
    const symbolMap: Record<string, string> = {
      '0x2::sui::SUI': 'SUI',
      '0x2::usdc::USDC': 'USDC',
      '0x2::usdt::USDT': 'USDT',
      '0x2::btc::BTC': 'BTC',
      '0x2::eth::ETH': 'ETH',
    };
    
    return symbolMap[coinType] || coinType.split('::').pop() || 'UNKNOWN';
  }

  /**
   * 获取代币小数位数
   */
  private getTokenDecimals(coinType: string): number {
    const decimalsMap: Record<string, number> = {
      '0x2::sui::SUI': 9,
      '0x2::usdc::USDC': 6,
      '0x2::usdt::USDT': 6,
      '0x2::btc::BTC': 8,
      '0x2::eth::ETH': 18,
    };
    
    return decimalsMap[coinType] || 0;
  }

  /**
   * 格式化余额显示
   */
  formatBalance(amount: string, decimals: number): string {
    const bigIntAmount = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const wholePart = bigIntAmount / divisor;
    const fractionalPart = bigIntAmount % divisor;
    
    if (fractionalPart === 0n) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    return `${wholePart}.${fractionalStr}`;
  }

  /**
   * 生成交易摘要
   */
  generateTransactionSummary(parsedInfo: ParsedTransactionInfo): string {
    const { transactionType, sender, recipients, balanceChanges, status } = parsedInfo;
    
    let summary = `[${status.toUpperCase()}] ${transactionType}`;
    
    if (sender !== 'unknown') {
      summary += ` | 发送者: ${sender}`;
    }
    
    if (recipients.length > 0) {
      summary += ` | 接收者: ${recipients.join(', ')}`;
    }
    
    if (balanceChanges.length > 0) {
      const changes = balanceChanges.map(change => 
        `${change.changeType === 'increase' ? '+' : '-'}${change.amount} ${change.symbol}`
      );
      summary += ` | 余额变化: ${changes.join(', ')}`;
    }
    
    return summary;
  }
} 