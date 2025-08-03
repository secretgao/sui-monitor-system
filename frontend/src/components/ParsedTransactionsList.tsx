'use client';

import React, { useState, useEffect } from 'react';
import { gatewayClient } from '../services/microservice-client';
import { utils } from '../services/api';
import { DataTable } from './ui/DataTable';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const ParsedTransactionsList: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<Array<{type: string, count: number}>>([
    // 默认交易类型列表，避免前端错误
    { type: 'SUI Transfer', count: 0 },
    { type: 'Move Function Call', count: 0 },
    { type: 'Object Transfer', count: 0 },
    { type: 'Payment', count: 0 },
    { type: 'Module Publish', count: 0 },
    { type: 'Module Upgrade', count: 0 },
    { type: 'Batch Transaction', count: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (selectedType === 'all') {
        data = await gatewayClient.getLatestParsedTransactions(limit);
      } else {
        data = await gatewayClient.getParsedTransactionsByType(selectedType);
      }
      
      // 确保 data 是数组
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        console.warn('交易数据格式不正确:', data);
        setTransactions([]);
        setError('暂无解析交易数据，请稍后再试');
      }
    } catch (err) {
      console.error('获取交易数据失败:', err);
      setError('网络请求失败，请检查服务连接');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionTypes = async () => {
    try {
      const data = await gatewayClient.getTransactionTypes();
      // 确保 data 是数组，如果不是则保持默认值
      if (Array.isArray(data) && data.length > 0) {
        setTransactionTypes(data);
      } else {
        console.warn('交易类型数据格式不正确或为空:', data);
        // 保持默认的交易类型列表，不设置为空数组
      }
    } catch (err) {
      console.error('获取交易类型失败:', err);
      // 保持默认的交易类型列表，不设置为空数组
    }
  };

  useEffect(() => {
    fetchTransactionTypes();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [limit, selectedType]);

  const columns = [
    {
      key: 'digest',
      title: '交易哈希',
      render: (value: string) => (
        <div className="font-mono text-sm">
          {utils.formatAddress(value, 12)}
        </div>
      ),
    },
    {
      key: 'timestamp',
      title: '时间',
      render: (value: string) => (
        <div className="text-sm">
          {utils.formatTime(value)}
        </div>
      ),
    },
    {
      key: 'sender',
      title: '发送者',
      render: (value: string) => (
        <div className="font-mono text-sm">
          {utils.formatAddress(value, 8)}
        </div>
      ),
    },
    {
      key: 'transactionType',
      title: '交易类型',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${utils.getTransactionTypeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${utils.getStatusColor(value)}`}>
          {value === 'success' ? '成功' : '失败'}
        </span>
      ),
    },
    {
      key: 'balanceChanges',
      title: '余额变化',
      render: (value: any[]) => (
        <div className="text-xs space-y-1">
          {value && value.length > 0 ? (
            value.slice(0, 2).map((change, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span className={change.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {change.changeType === 'increase' ? '+' : '-'}
                </span>
                <span>{utils.formatTokenAmount(change.amount, 9)}</span>
                <span className="text-gray-500">{change.symbol}</span>
              </div>
            ))
          ) : (
            <span className="text-gray-400">无变化</span>
          )}
        </div>
      ),
    },
    {
      key: 'gasUsed',
      title: 'Gas消耗',
      render: (value: string) => (
        <div className="text-sm">
          {utils.formatNumber(value)}
        </div>
      ),
    },
    {
      key: 'summary',
      title: '摘要',
      render: (value: string) => (
        <div className="text-xs text-gray-600 max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">解析交易列表</h2>
        <div className="flex items-center space-x-4">
          {/* 交易类型筛选 */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[200px]"
          >
            <option value="all">所有交易类型</option>
            {transactionTypes.map((type) => (
              <option key={type.type} value={type.type}>
                {type.type} ({type.count})
              </option>
            ))}
          </select>
          
          {/* 数量限制 */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value={10}>10条</option>
            <option value={20}>20条</option>
            <option value={50}>50条</option>
            <option value={100}>100条</option>
          </select>
          
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 筛选状态提示 */}
      {selectedType !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              当前筛选: <span className="font-medium">{selectedType}</span>
              <span className="text-blue-600 ml-2">({transactions.length} 条记录)</span>
            </span>
            <button
              onClick={() => setSelectedType('all')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              清除筛选
            </button>
          </div>
        </div>
      )}

      {error ? (
        <ErrorMessage error={error} onRetry={fetchTransactions} />
      ) : (
        <DataTable
          data={transactions}
          columns={columns}
          loading={loading}
          emptyText="暂无解析交易数据"
        />
      )}
    </div>
  );
}; 