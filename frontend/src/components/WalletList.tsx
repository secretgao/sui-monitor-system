'use client';

import React, { useState, useEffect } from 'react';
import { walletsApi, Wallet, utils } from '../services/api';
import { DataTable } from './ui/DataTable';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import Link from 'next/link';

export const WalletList: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await walletsApi.getAll(page, limit);
      
      if (response.success && response.data) {
        setWallets(response.data.wallets);
        setTotal(response.data.total);
      } else {
        setError(response.error || '获取钱包数据失败');
      }
    } catch (err) {
      setError('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [page, limit]);

  const columns = [
    {
      key: 'address',
      title: '钱包地址',
      render: (value: string) => (
        <Link 
          href={`/wallets/${value}`}
          className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          {utils.formatAddress(value, 12)}
        </Link>
      ),
    },
    {
      key: 'totalValueUsd',
      title: '总价值 (USD)',
      render: (value: number) => (
        <div className="text-sm font-medium">
          ${utils.formatNumber(value)}
        </div>
      ),
    },
    {
      key: 'transactionCount',
      title: '交易总数',
      render: (value: number) => (
        <div className="text-sm">
          {utils.formatNumber(value)}
        </div>
      ),
    },
    {
      key: 'sentTransactionCount',
      title: '发送交易',
      render: (value: number) => (
        <div className="text-sm text-red-600">
          {utils.formatNumber(value)}
        </div>
      ),
    },
    {
      key: 'receivedTransactionCount',
      title: '接收交易',
      render: (value: number) => (
        <div className="text-sm text-green-600">
          {utils.formatNumber(value)}
        </div>
      ),
    },
    {
      key: 'firstSeenAt',
      title: '首次出现',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {utils.formatTime(value)}
        </div>
      ),
    },
    {
      key: 'lastSeenAt',
      title: '最后活动',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {utils.formatTime(value)}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">钱包列表</h2>
        <div className="flex items-center space-x-4">
          {/* 分页控制 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">每页:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          <button
            onClick={fetchWallets}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center justify-between">
          <span className="text-blue-800">
            共 <span className="font-medium">{utils.formatNumber(total)}</span> 个钱包
          </span>
          <span className="text-blue-600 text-sm">
            第 {page} 页，共 {totalPages} 页
          </span>
        </div>
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={fetchWallets} />
      ) : (
        <>
          <DataTable
            data={wallets}
            columns={columns}
            loading={loading}
            emptyText="暂无钱包数据"
          />

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                上一页
              </button>
              
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 