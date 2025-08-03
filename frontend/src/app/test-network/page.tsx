'use client';

import React, { useState, useEffect } from 'react';
import { monitorApi } from '../../services/api';

export default function TestNetworkPage() {
  const [networkData, setNetworkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [networkResponse, networkInfoResponse, networksResponse] = await Promise.all([
        monitorApi.getNetwork(),
        monitorApi.getNetworkInfo(),
        monitorApi.getNetworks()
      ]);

      setNetworkData({
        network: networkResponse,
        networkInfo: networkInfoResponse,
        networks: networksResponse
      });
    } catch (err) {
      setError('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">错误: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">网络信息API测试</h1>
        
        <div className="space-y-6">
          {/* 当前网络信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">当前网络信息 (/monitor/network)</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(networkData?.network, null, 2)}
            </pre>
          </div>

          {/* 完整网络信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">完整网络信息 (/monitor/network-info)</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(networkData?.networkInfo, null, 2)}
            </pre>
          </div>

          {/* 所有网络 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">所有网络 (/monitor/networks)</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(networkData?.networks, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={fetchNetworkData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            刷新数据
          </button>
        </div>
      </div>
    </div>
  );
} 