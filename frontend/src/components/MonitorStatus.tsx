'use client';

import React, { useState, useEffect } from 'react';
import { gatewayClient } from '../services/microservice-client';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { utils } from '../services/api';

interface MonitorStatus {
  isRunning: boolean;
  lastProcessedBlock: number;
  currentBlock: number;
  uptime: number;
  network: {
    name: string;
    type: string;
    rpcUrl: string;
    description: string;
  };
}

export default function MonitorStatusComponent() {
  const [status, setStatus] = useState<MonitorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用微服务客户端获取状态
      const statusData = await gatewayClient.getMonitorStatus();
      const networkData = await gatewayClient.getNetworkInfo();
      
      setStatus({
        ...statusData,
        network: networkData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取状态失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    try {
      setActionLoading(action);
      setError(null);

      switch (action) {
        case 'start':
          await gatewayClient.startMonitoring();
          break;
        case 'stop':
          await gatewayClient.stopMonitoring();
          break;
        case 'reset':
          await gatewayClient.resetMonitoring();
          break;
        case 'test':
          await gatewayClient.testConnection();
          break;
      }

      // 刷新状态
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action}操作失败`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // 每5秒刷新一次
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchStatus} />;
  }

  if (!status) {
    return <ErrorMessage error="无法获取监控状态" onRetry={fetchStatus} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">监控状态</h2>
      
      {/* 网络信息 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">网络信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">网络名称:</span>
            <span className="ml-2 text-gray-900">{status.network.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">网络类型:</span>
            <span className="ml-2 text-gray-900">{status.network.type}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">RPC地址:</span>
            <span className="ml-2 text-gray-900 text-sm">{status.network.rpcUrl}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">描述:</span>
            <span className="ml-2 text-gray-900">{status.network.description}</span>
          </div>
        </div>
      </div>

      {/* 监控状态 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">监控状态</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">运行状态:</span>
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              status.isRunning 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {status.isRunning ? '运行中' : '已停止'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">最后处理区块:</span>
            <span className="ml-2 text-gray-900">{utils.formatNumber(status.lastProcessedBlock)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">当前区块:</span>
            <span className="ml-2 text-gray-900">{utils.formatNumber(status.currentBlock)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">运行时间:</span>
            <span className="ml-2 text-gray-900">{Math.floor(status.uptime / 1000)}秒</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleAction('start')}
          disabled={status.isRunning || actionLoading === 'start'}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === 'start' ? <LoadingSpinner size="sm" /> : '开始监控'}
        </button>
        
        <button
          onClick={() => handleAction('stop')}
          disabled={!status.isRunning || actionLoading === 'stop'}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === 'stop' ? <LoadingSpinner size="sm" /> : '停止监控'}
        </button>
        
        <button
          onClick={() => handleAction('reset')}
          disabled={actionLoading === 'reset'}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === 'reset' ? <LoadingSpinner size="sm" /> : '重置监控'}
        </button>
        
        <button
          onClick={() => handleAction('test')}
          disabled={actionLoading === 'test'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === 'test' ? <LoadingSpinner size="sm" /> : '测试连接'}
        </button>
      </div>
    </div>
  );
} 