export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">样式测试页面</h1>
        
        {/* 基础样式测试 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">基础样式测试</h2>
            <div className="space-y-2">
              <p className="text-gray-600">普通文本</p>
              <p className="text-blue-600 font-medium">蓝色文本</p>
              <p className="text-green-600 font-bold">绿色粗体文本</p>
              <p className="text-red-600 text-sm">红色小文本</p>
            </div>
          </div>

          {/* 按钮样式测试 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">按钮样式测试</h2>
            <div className="space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                主要按钮
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                成功按钮
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                危险按钮
              </button>
            </div>
          </div>

          {/* 卡片样式测试 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">卡片样式测试</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-4">
                <h3 className="font-semibold">统计卡片</h3>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm opacity-90">总交易数</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-gray-900">交易卡片</h3>
                <p className="text-gray-600">交易详情</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">信息卡片</h3>
                <p className="text-gray-600">信息内容</p>
              </div>
            </div>
          </div>

          {/* 状态样式测试 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">状态样式测试</h2>
            <div className="space-x-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                成功
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                失败
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                待处理
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 