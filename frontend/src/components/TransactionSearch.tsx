'use client';

import React, { useState } from 'react';
import { parsedTransactionsApi, ParsedTransaction, utils } from '../services/api';
import { DataTable } from './ui/DataTable';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const TransactionSearch: React.FC = () => {
  const [searchType, setSearchType] = useState<'address' | 'type' | 'token' | 'digest' | 'block'>('address');
  const [searchValue, setSearchValue] = useState('');
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('请输入搜索内容');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let response;

      switch (searchType) {
        case 'address':
          response = await parsedTransactionsApi.getBySender(searchValue, limit);
          break;
        case 'type':
          response = await parsedTransactionsApi.getByTransactionType(searchValue, limit);
          break;
        case 'token':
          response = await parsedTransactionsApi.getByToken(searchValue, limit);
          break;
        case 'digest':
          response = await parsedTransactionsApi.getByDigest(searchValue);
          if (response.success && response.data) {
            setTransactions([response.data]);
          } else {
            setTransactions([]);
          }
          return;
        case 'block':
          const blockNumber = parseInt(searchValue);
          if (isNaN(blockNumber)) {
            setError('请输入有效的区块号');
            return;
          }
          response = await parsedTransactionsApi.getByBlockNumber(blockNumber);
          break;
      }

      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setError(response.error || '搜索失败');
        setTransactions([]);
      }
    } catch (err) {
      setError('网络请求失败');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'address':
        return '输入钱包地址 (例如: 0x1234...)';
      case 'type':
        return '输入交易类型 (例如: SUI Transfer, Move Function Call)';
      case 'token':
        return '输入代币类型 (例如: 0x2::sui::SUI)';
      case 'digest':
        return '输入交易哈希 (例如: 0x1234...)';
      case 'block':
        return '输入区块号 (例如: 174493556)';
      default:
        return '请输入搜索内容';
    }
  };

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
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交易搜索</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="address">按钱包地址搜索</option>
            <option value="type">按交易类型搜索</option>
            <option value="token">按代币类型搜索</option>
            <option value="digest">按交易哈希搜索</option>
            <option value="block">按区块号搜索</option>
          </select>
          
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">显示数量:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value={10}>10条</option>
            <option value={20}>20条</option>
            <option value={50}>50条</option>
            <option value={100}>100条</option>
          </select>
        </div>
      </div>

      {error && (
        <ErrorMessage error={error} onRetry={handleSearch} />
      )}

      {loading ? (
        <LoadingSpinner text="搜索中..." />
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              搜索结果 ({transactions.length} 条)
            </h3>
          </div>
          <DataTable
            data={transactions}
            columns={columns}
            emptyText="暂无搜索结果"
          />
        </div>
      ) : searchValue && !loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">未找到相关交易</h3>
            <p className="mt-1 text-sm text-gray-500">请尝试其他搜索条件</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}; 