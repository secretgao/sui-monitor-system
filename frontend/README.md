# Sui链监控系统 - 前端

## 🎯 项目概述

这是Sui链监控系统的前端部分，基于Next.js 14和TypeScript构建，提供了完整的用户界面来访问后端API的所有功能。

## 🚀 功能特性

### 1. 监控状态管理
- 实时显示监控器运行状态
- 网络信息展示（主网/测试网/开发网）
- 启动/停止监控控制
- 连接测试功能

### 2. 交易数据展示
- 解析交易列表展示
- 交易类型分类显示
- 钱包地址信息
- 代币余额变化
- Gas消耗统计

### 3. 高级搜索功能
- 按钱包地址搜索
- 按交易类型搜索
- 按代币类型搜索
- 按交易哈希搜索
- 按区块号搜索

### 4. 统计信息
- 交易总数统计
- 交易类型分布
- 交易状态分布
- 实时数据更新

## 📁 项目结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 首页
│   │   ├── monitor/           # 监控状态页面
│   │   ├── transactions/      # 交易列表页面
│   │   ├── search/            # 搜索页面
│   │   ├── statistics/        # 统计页面
│   │   ├── layout.tsx         # 布局组件
│   │   └── globals.css        # 全局样式
│   ├── components/            # React组件
│   │   ├── ui/               # 通用UI组件
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── DataTable.tsx
│   │   ├── Navigation.tsx     # 导航组件
│   │   ├── MonitorStatus.tsx  # 监控状态组件
│   │   ├── ParsedTransactionsList.tsx # 交易列表组件
│   │   ├── TransactionSearch.tsx      # 搜索组件
│   │   └── Statistics.tsx     # 统计组件
│   └── services/              # API服务
│       └── api.ts            # API接口封装
├── package.json
├── next.config.js
└── README.md
```

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **HTTP客户端**: Fetch API
- **图标**: Heroicons (SVG)

## 🚀 快速开始

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 配置环境变量
创建 `.env.local` 文件：
```env
# 后端API地址
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📱 页面说明

### 首页 (/)
- 系统概览
- 监控状态卡片
- 统计信息展示
- 最新交易列表

### 监控状态 (/monitor)
- 实时监控状态
- 网络配置信息
- 控制按钮（启动/停止/重置）
- 连接测试

### 交易列表 (/transactions)
- 解析交易数据表格
- 分页显示
- 实时刷新
- 数据筛选

### 交易搜索 (/search)
- 多条件搜索
- 按地址/类型/代币/哈希/区块搜索
- 搜索结果展示
- 高级筛选

### 统计信息 (/statistics)
- 数据统计卡片
- 交易类型分布
- 交易状态分布
- 快速操作入口

## 🔧 API集成

### 监控相关接口
- `GET /monitor/status` - 获取监控状态
- `GET /monitor/network` - 获取网络信息
- `POST /monitor/start` - 启动监控
- `POST /monitor/stop` - 停止监控
- `POST /monitor/reset` - 重置监控
- `POST /monitor/test-connection` - 测试连接

### 交易相关接口
- `GET /parsed-transactions` - 获取解析交易列表
- `GET /parsed-transactions/digest/{digest}` - 根据哈希查询
- `GET /parsed-transactions/sender/{sender}` - 根据发送者查询
- `GET /parsed-transactions/type/{type}` - 根据类型查询
- `GET /parsed-transactions/token/{token}` - 根据代币查询
- `GET /parsed-transactions/statistics` - 获取统计信息

### 原始数据接口
- `GET /transactions` - 获取原始交易数据
- `GET /blocks` - 获取区块数据
- `GET /transaction-responses` - 获取交易响应数据

## 🎨 UI组件

### LoadingSpinner
加载动画组件，支持不同尺寸和文本。

### ErrorMessage
错误信息展示组件，支持重试功能。

### DataTable
通用数据表格组件，支持自定义列和渲染函数。

### Navigation
响应式导航组件，支持移动端菜单。

## 📊 数据展示

### 交易信息
- 交易哈希（截断显示）
- 时间戳（格式化）
- 发送者地址
- 交易类型（颜色标识）
- 状态（成功/失败）
- 余额变化
- Gas消耗

### 统计信息
- 总数统计
- 类型分布
- 状态分布
- 时间趋势

## 🔍 搜索功能

### 搜索类型
1. **钱包地址搜索**: 查询特定地址的交易
2. **交易类型搜索**: 按交易类型筛选
3. **代币类型搜索**: 按代币类型筛选
4. **交易哈希搜索**: 精确查询特定交易
5. **区块号搜索**: 查询特定区块的交易

### 搜索特性
- 实时搜索建议
- 搜索结果高亮
- 分页显示
- 结果统计

## 📱 响应式设计

- 移动端友好的导航菜单
- 响应式数据表格
- 自适应布局
- 触摸友好的交互

## 🚀 部署

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

### Docker部署
```bash
docker build -t sui-monitor-frontend .
docker run -p 3000:3000 sui-monitor-frontend
```

## 🔧 开发指南

### 添加新页面
1. 在 `src/app/` 下创建新目录
2. 添加 `page.tsx` 文件
3. 在导航组件中添加链接

### 添加新组件
1. 在 `src/components/` 下创建组件文件
2. 导出组件
3. 在页面中导入使用

### 添加新API接口
1. 在 `src/services/api.ts` 中添加接口定义
2. 在组件中调用接口
3. 处理响应数据

## 🐛 故障排除

### 常见问题

1. **API连接失败**
   - 检查后端服务是否运行
   - 确认API地址配置正确
   - 检查网络连接

2. **数据不显示**
   - 检查API响应格式
   - 确认数据解析正确
   - 查看浏览器控制台错误

3. **样式问题**
   - 确认Tailwind CSS配置
   - 检查类名拼写
   - 清除浏览器缓存

## 📄 许可证

MIT License

---

**注意**: 确保后端服务正在运行，并且API地址配置正确。 