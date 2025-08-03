'use client';

import React, { useState, useEffect } from 'react';
import { monitorApi } from '../../services/api';

export default function TestMonitorPage() {
  const [status, setStatus] = useState<any>(null);
  const [network, setNetwork] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statusResponse, networkResponse] = await Promise.all([
        monitorApi.getStatus(),
        monitorApi.getNetwork()
      ]);

      if (statusResponse.success && statusResponse.data) {
        setStatus(statusResponse.data);
      }

      if (networkResponse.success && networkResponse.data) {
        setNetwork(networkResponse.data);
      }
    } catch (err) {
      setError('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestResult(null);
      const response = await monitorApi.testConnection();
      setTestResult(response);
    } catch (err) {
      setTestResult({ success: false, error: '测试连接失败' });
    }
  };

  useEffect(() => {
    fetchData();
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
        <h1 className="text-2xl font-bold mb-6">监控API测试</h1>
        
        <div className="space-y-6">
          {/* 监控状态 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">监控状态</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>

          {/* 网络信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">网络信息</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(network, null, 2)}
            </pre>
          </div>

          {/* 测试连接 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">测试连接</h2>
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
            >
              测试连接
            </button>
            {testResult && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            刷新数据
          </button>
        </div>
      </div>
    </div>
  );
} 