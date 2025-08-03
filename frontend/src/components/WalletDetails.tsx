'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { walletsApi, WalletDetails, WalletAsset, utils } from '../services/api';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import Link from 'next/link';

export const WalletDetailsComponent: React.FC = () => {
  const params = useParams();
  const address = params.address as string;
  
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await walletsApi.getDetails(address);
      
      if (response.success && response.data) {
        setWalletDetails(response.data);
      } else {
        setError(response.error || '获取钱包详情失败');
      }
    } catch (err) {
      setError('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchWalletDetails();
    }
  }, [address]);

  if (loading) {
    return <LoadingSpinner text="加载钱包详情..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchWalletDetails} />;
  }

  if (!walletDetails) {
    return <div className="text-center text-gray-600">钱包不存在</div>;
  }

  const { wallet, assets } = walletDetails;

  return (
    <div className="space-y-6">
      {/* 返回链接 */}
      <div>
        <Link 
          href="/wallets"
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          ← 返回钱包列表
        </Link>
      </div>

      {/* 钱包基本信息 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">钱包详情</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">基本信息</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">地址:</span>
                <span className="font-mono text-sm">{wallet.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总价值:</span>
                <span className="font-medium text-green-600">
                  ${utils.formatNumber(wallet.totalValueUsd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">首次出现:</span>
                <span className="text-sm">{utils.formatTime(wallet.firstSeenAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最后活动:</span>
                <span className="text-sm">{utils.formatTime(wallet.lastSeenAt)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">交易统计</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">总交易数:</span>
                <span className="font-medium">{utils.formatNumber(wallet.transactionCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">发送交易:</span>
                <span className="text-red-600">{utils.formatNumber(wallet.sentTransactionCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">接收交易:</span>
                <span className="text-green-600">{utils.formatNumber(wallet.receivedTransactionCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">资产数量:</span>
                <span className="font-medium">{utils.formatNumber(assets.length)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 资产列表 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">资产列表</h2>
        
        {assets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无资产数据
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    代币
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    余额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    单价 (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    价值 (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后更新
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {asset.iconUrl && (
                          <img 
                            src={asset.iconUrl} 
                            alt={asset.symbol || asset.name} 
                            className="w-6 h-6 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset.symbol || asset.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {utils.formatAddress(asset.coinType, 20)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {utils.formatTokenAmount(asset.balance.toString(), asset.decimals || 9)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.priceUsd ? `$${utils.formatNumber(asset.priceUsd)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {asset.valueUsd ? `$${utils.formatNumber(asset.valueUsd)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {utils.formatTime(asset.lastUpdatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center space-x-4">
        <Link
          href={`/transactions?sender=${wallet.address}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          查看发送交易
        </Link>
        <Link
          href={`/transactions?recipient=${wallet.address}`}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          查看接收交易
        </Link>
        <button
          onClick={fetchWalletDetails}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          刷新数据
        </button>
      </div>
    </div>
  );
}; 