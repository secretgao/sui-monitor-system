# Sui 链监控系统

一个基于微服务架构的 Sui Move 链交易监控系统，采用 NestJS 微服务和 Next.js 前端，提供实时区块链数据监控、交易解析、钱包管理和可视化展示。

## 🚀 功能特性

- 🔍 **实时监控**: 自动扫描 Sui 链上的新区块和交易
- 🏗️ **微服务架构**: 模块化设计，支持独立部署和扩展
- 📊 **数据解析**: 智能解析交易类型、余额变化和钱包信息
- 💾 **数据存储**: PostgreSQL 数据库存储，支持复杂查询
- 🌐 **Web 界面**: 现代化的 React 前端界面
- 📱 **响应式设计**: 支持移动端和桌面端访问
- 📝 **完整日志**: 详细的请求、响应和微服务通信日志
- 🔄 **实时更新**: 支持实时数据刷新和状态监控

## 🏗️ 系统架构

### 微服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (Next.js)     │◄──►│   (Port 4000)   │◄──►│                 │
│   (Port 3000)   │    │                 │    │ ┌─────────────┐ │
└─────────────────┘    └─────────────────┘    │ │   Monitor   │ │
                                             │ │  (Port 4001) │ │
                                             │ └─────────────┘ │
                                             │ ┌─────────────┐ │
                                             │ │Transaction  │ │
                                             │ │(Port 4002)  │ │
                                             │ └─────────────┘ │
                                             │ ┌─────────────┐ │
                                             │ │   Wallet    │ │
                                             │ │(Port 4003)  │ │
                                             │ └─────────────┘ │
                                             │ ┌─────────────┐ │
                                             │ │   Block     │ │
                                             │ │(Port 4004)  │ │
                                             │ └─────────────┘ │
                                             └─────────────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │   PostgreSQL    │
                                             │   Database      │
                                             └─────────────────┘
```

### 技术栈

#### 后端 (NestJS 微服务)
- **框架**: NestJS + TypeScript
- **微服务**: TCP 传输协议
- **数据库**: PostgreSQL + TypeORM
- **区块链**: Sui SDK (@mysten/sui.js)
- **定时任务**: @nestjs/schedule
- **API文档**: Swagger
- **日志系统**: 自定义文件日志记录器

#### 前端 (Next.js)
- **框架**: Next.js 14 (App Router)
- **UI库**: Tailwind CSS + Headless UI
- **状态管理**: React Hooks + SWR
- **HTTP客户端**: Axios
- **图表**: Recharts

## 📁 项目结构

```
sui-monitor-system/
├── backend/                          # NestJS 后端微服务
│   ├── src/
│   │   ├── entities/                 # 数据库实体
│   │   │   ├── transaction.entity.ts
│   │   │   ├── parsed-transaction.entity.ts
│   │   │   ├── block.entity.ts
│   │   │   ├── wallet.entity.ts
│   │   │   └── wallet-asset.entity.ts
│   │   ├── gateway/                  # API 网关
│   │   │   ├── gateway.controller.ts
│   │   │   └── gateway.module.ts
│   │   ├── monitor/                  # 监控微服务
│   │   │   ├── monitor.service.ts
│   │   │   ├── monitor.microservice.ts
│   │   │   └── monitor.microservice.main.ts
│   │   ├── transactions/             # 交易微服务
│   │   │   ├── transactions.service.ts
│   │   │   ├── transactions.controller.ts
│   │   │   └── transactions.microservice.module.ts
│   │   ├── wallets/                  # 钱包微服务
│   │   │   ├── wallets.service.ts
│   │   │   ├── wallets.controller.ts
│   │   │   └── wallets.microservice.module.ts
│   │   ├── blocks/                   # 区块微服务
│   │   │   ├── blocks.service.ts
│   │   │   ├── blocks.controller.ts
│   │   │   └── blocks.microservice.module.ts
│   │   ├── common/                   # 公共组件
│   │   │   ├── logger.config.ts      # 日志配置
│   │   │   ├── logging.interceptor.ts # HTTP 日志拦截器
│   │   │   └── microservice-logging.interceptor.ts # 微服务日志拦截器
│   │   ├── microservices/            # 微服务配置
│   │   │   ├── microservices.config.ts
│   │   │   └── patterns.ts
│   │   └── config/                   # 配置文件
│   ├── logs/                         # 日志文件目录
│   │   ├── gateway/
│   │   ├── monitor/
│   │   ├── transaction/
│   │   ├── wallet/
│   │   └── block/
│   ├── start-with-logs.sh           # 启动脚本（带日志）
│   ├── view-logs.sh                 # 日志查看脚本
│   └── package.json
├── frontend/                         # Next.js 前端
│   ├── src/
│   │   ├── app/                     # App Router 页面
│   │   │   ├── page.tsx             # 首页
│   │   │   ├── monitor/             # 监控页面
│   │   │   ├── transactions/        # 交易页面
│   │   │   ├── wallets/             # 钱包页面
│   │   │   └── blocks/              # 区块页面
│   │   ├── components/              # React 组件
│   │   │   ├── MonitorStatus.tsx
│   │   │   ├── ParsedTransactionsList.tsx
│   │   │   ├── WalletList.tsx
│   │   │   └── BlockList.tsx
│   │   └── services/                # API 服务
│   │       └── microservice-client.ts
│   ├── package.json
│   └── next.config.js
├── LOGGING.md                       # 日志系统文档
└── README.md
```

## 🚀 快速开始

### 1. 环境要求

- **Node.js**: 18+
- **PostgreSQL**: 12+
- **npm**: 8+

### 2. 克隆项目

```bash
git clone <repository-url>
cd sui-monitor-system
```

### 3. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 在项目根目录 使用docker-compose up -d 启动PostgreSQL 数据库
docker-compose up -d 
```

### 4. 数据库配置

 

3. **修改 `.env` 文件**:
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=sui_monitor

# Sui 网络配置
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
SUI_WS_URL=wss://fullnode.mainnet.sui.io:443

# 微服务端口配置
GATEWAY_PORT=4000
MONITOR_PORT=4001
TRANSACTION_PORT=4002
WALLET_PORT=4003
BLOCK_PORT=4004

# 日志配置
LOG_LEVEL=info
```

### 5. 启动服务

#### 方式一：使用启动脚本（推荐）

```bash
cd backend
chmod +x start-with-logs.sh
./start-with-logs.sh
```

#### 方式二：分别启动

```bash
# 终端 1: 启动 API Gateway
cd backend
npm run start:gateway

# 终端 2: 启动监控微服务
cd backend
npm run start:monitor

# 终端 3: 启动交易微服务
cd backend
npm run start:transaction

# 终端 4: 启动钱包微服务
cd backend
npm run start:wallet

# 终端 5: 启动区块微服务
cd backend
npm run start:block

# 终端 6: 启动前端
cd frontend
npm run dev
```

### 6. 访问应用

- **前端界面**: http://localhost:3000
- **API 网关**: http://localhost:4000
- **API 文档**: http://localhost:4000/api-docs

## 📊 核心功能

### 监控服务 (Monitor Service)
- **实时扫描**: 自动扫描 Sui 链上的新区块
- **交易解析**: 智能解析交易类型和内容
- **数据存储**: 将解析后的数据存储到数据库
- **状态监控**: 提供扫描状态和进度信息

### 交易服务 (Transaction Service)
- **交易查询**: 支持多种查询条件
- **交易统计**: 提供详细的交易统计数据
- **解析交易**: 查询已解析的交易信息
- **类型分析**: 按交易类型进行分组统计

### 钱包服务 (Wallet Service)
- **钱包管理**: 自动发现和跟踪钱包地址
- **资产查询**: 查询钱包的资产信息
- **交易历史**: 查看钱包的交易历史
- **余额变化**: 跟踪钱包余额变化

### 区块服务 (Block Service)
- **区块信息**: 提供区块详细信息
- **区块统计**: 区块级别的统计数据
- **最新区块**: 获取最新区块信息

## 🔧 API 接口

### 监控相关
- `GET /api/monitor/status` - 获取监控状态
- `POST /api/monitor/start` - 启动监控
- `POST /api/monitor/stop` - 停止监控
- `POST /api/monitor/reset` - 重置监控
- `GET /api/monitor/network-info` - 获取网络信息

### 交易相关
- `GET /api/transactions/latest` - 获取最新交易
- `GET /api/transactions/digest/:digest` - 根据哈希获取交易
- `GET /api/transactions/block/:blockNumber` - 根据区块获取交易
- `GET /api/transactions/sender/:sender` - 根据发送者获取交易
- `GET /api/parsed-transactions` - 获取解析的交易
- `GET /api/parsed-transactions/statistics` - 获取解析交易统计

### 钱包相关
- `GET /api/wallets` - 获取钱包列表
- `GET /api/wallets/:address` - 获取钱包详情
- `GET /api/wallets/:address/assets` - 获取钱包资产
- `GET /api/wallets/search/:query` - 搜索钱包

### 区块相关
- `GET /api/blocks/latest` - 获取最新区块
- `GET /api/blocks/:blockNumber` - 根据区块号获取区块
- `GET /api/blocks/statistics` - 获取区块统计

## 📝 日志系统

### 日志文件结构
```
backend/logs/
├── gateway/           # API 网关日志
├── monitor/           # 监控服务日志
├── transaction/       # 交易服务日志
├── wallet/            # 钱包服务日志
└── block/             # 区块服务日志
```

### 日志查看

```bash
# 查看所有服务日志
cd backend
./view-logs.sh all

# 查看特定服务日志
./view-logs.sh monitor -f          # 实时查看监控日志
./view-logs.sh gateway -n 50       # 查看网关最后 50 行
./view-logs.sh transaction -e      # 查看交易服务错误日志
./view-logs.sh all -r              # 查看所有服务的请求日志
```

### 日志类型
- **启动日志**: 服务启动和配置信息
- **请求日志**: HTTP 请求和响应信息
- **微服务日志**: 微服务间通信信息
- **错误日志**: 错误和异常信息
- **业务日志**: 业务逻辑执行信息

## 🗄️ 数据库设计

### 核心表结构

#### transactions 表
- `id`: 主键
- `digest`: 交易哈希
- `blockNumber`: 区块号
- `timestamp`: 时间戳
- `sender`: 发送者地址
- `status`: 交易状态
- `gasUsed`: Gas 使用量
- `gasPrice`: Gas 价格
- `effects`: 交易效果 (JSON)

#### parsed_transactions 表
- `id`: 主键
- `digest`: 交易哈希
- `transactionType`: 交易类型
- `sender`: 发送者地址
- `recipients`: 接收者地址 (JSON)
- `balanceChanges`: 余额变化 (JSON)
- `parsedData`: 解析数据 (JSON)

#### wallets 表
- `id`: 主键
- `address`: 钱包地址
- `firstSeen`: 首次出现时间
- `lastSeen`: 最后出现时间
- `transactionCount`: 交易数量

#### wallet_assets 表
- `id`: 主键
- `walletId`: 钱包 ID
- `coinType`: 代币类型
- `balance`: 余额
- `lastUpdated`: 最后更新时间

#### blocks 表
- `id`: 主键
- `blockNumber`: 区块号
- `blockHash`: 区块哈希
- `timestamp`: 时间戳
- `transactionCount`: 交易数量
- `totalGasUsed`: 总 Gas 使用量

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DB_HOST` | 数据库主机 | localhost |
| `DB_PORT` | 数据库端口 | 5432 |
| `DB_USERNAME` | 数据库用户名 | postgres |
| `DB_PASSWORD` | 数据库密码 | - |
| `DB_DATABASE` | 数据库名称 | sui_monitor |
| `SUI_RPC_URL` | Sui RPC 地址 | https://fullnode.mainnet.sui.io:443 |
| `SUI_WS_URL` | Sui WebSocket 地址 | wss://fullnode.mainnet.sui.io:443 |
| `GATEWAY_PORT` | API 网关端口 | 4000 |
| `MONITOR_PORT` | 监控服务端口 | 4001 |
| `TRANSACTION_PORT` | 交易服务端口 | 4002 |
| `WALLET_PORT` | 钱包服务端口 | 4003 |
| `BLOCK_PORT` | 区块服务端口 | 4004 |
| `LOG_LEVEL` | 日志级别 | info |

### 微服务配置

微服务使用 TCP 传输协议，各服务端口配置在 `backend/src/microservices/microservices.config.ts` 中。

## 🚀 部署指南

### 开发环境

```bash
# 使用启动脚本
cd backend
./start-with-logs.sh

# 新终端启动前端
cd frontend
npm run dev
```

### 生产环境

1. **构建项目**:
```bash
# 构建后端
cd backend
npm run build

# 构建前端
cd frontend
npm run build
```

2. **使用 PM2 部署**:
```bash
# 安装 PM2
npm install -g pm2

# 启动所有服务
pm2 start ecosystem.config.js
```

3. **Docker 部署**:
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## 🐛 故障排除

### 常见问题

1. **微服务启动失败**
   - 检查端口是否被占用: `lsof -i :4001`
   - 查看服务日志: `./view-logs.sh monitor -e`
   - 确认数据库连接正常

2. **API Gateway 连接失败**
   - 确认所有微服务已启动
   - 检查微服务端口配置
   - 查看网关日志: `./view-logs.sh gateway -e`

3. **数据库连接问题**
   - 验证 PostgreSQL 服务状态
   - 检查数据库连接配置
   - 确认数据库用户权限

4. **前端无法连接后端**
   - 确认 API Gateway 已启动
   - 检查 CORS 配置
   - 验证前端 API 地址配置

### 日志调试

```bash
# 查看实时日志
./view-logs.sh all -f

# 查看错误日志
./view-logs.sh all -e

# 查看特定服务的请求日志
./view-logs.sh gateway -r
```
 

**注意**: 这是一个开发中的项目，请在生产环境使用前进行充分测试。 