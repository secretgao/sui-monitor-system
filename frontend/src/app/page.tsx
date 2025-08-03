'use client';

import { Statistics } from '../components/Statistics';
import { ParsedTransactionsList } from '../components/ParsedTransactionsList';
import MonitorStatusComponent from '../components/MonitorStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 欢迎标题 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sui链监控系统
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              实时监控Sui区块链交易，提供详细的交易解析、钱包地址追踪、代币余额变化分析等功能
            </p>
          </div>

          {/* 监控状态 */}
          <MonitorStatusComponent />

          {/* 统计信息 */}
          <Statistics />

          {/* 最新交易列表 */}
          <ParsedTransactionsList />
        </div>
      </div>
    </div>
  );
} 