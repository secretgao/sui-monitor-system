'use client';

import React, { useState } from 'react';
import { gatewayClient } from '../../services/microservice-client';

export default function TestMicroservicesPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    try {
      setLoading(name);
      const result = await testFn();
      setResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        } 
      }));
    } finally {
      setLoading(null);
    }
  };

  const tests = [
    {
      name: 'Monitor Status',
      test: () => gatewayClient.getMonitorStatus(),
    },
    {
      name: 'Network Info',
      test: () => gatewayClient.getNetworkInfo(),
    },
    {
      name: 'Transaction Count',
      test: () => gatewayClient.getTransactionCount(),
    },
    {
      name: 'Latest Transactions',
      test: () => gatewayClient.getLatestTransactions(5),
    },
    {
      name: 'Wallet Statistics',
      test: () => gatewayClient.getWalletStatistics(),
    },
    {
      name: 'Block Count',
      test: () => gatewayClient.getBlockCount(),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">微服务测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {tests.map((test) => (
          <button
            key={test.name}
            onClick={() => testEndpoint(test.name, test.test)}
            disabled={loading === test.name}
            className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading === test.name ? '测试中...' : `测试 ${test.name}`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]) => (
          <div key={name} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{name}</h3>
            {result.success ? (
              <div className="bg-green-50 p-3 rounded">
                <p className="text-green-800">✅ 成功</p>
                <pre className="text-sm mt-2 overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-red-50 p-3 rounded">
                <p className="text-red-800">❌ 失败</p>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 