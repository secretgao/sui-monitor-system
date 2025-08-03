#!/bin/bash

echo "🚀 启动微服务架构..."

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ 端口 $1 已被占用"
        exit 1
    fi
}

# 检查所有端口
check_port 4000
check_port 4001
check_port 4002
check_port 4003
check_port 4004

echo "✅ 所有端口可用"

# 启动微服务
echo "📡 启动 Monitor Service (端口: 4001)..."
npm run start:monitor &
MONITOR_PID=$!

echo "📡 启动 Transaction Service (端口: 4002)..."
npm run start:transaction &
TRANSACTION_PID=$!

echo "📡 启动 Wallet Service (端口: 4003)..."
npm run start:wallet &
WALLET_PID=$!

echo "📡 启动 Block Service (端口: 4004)..."
npm run start:block &
BLOCK_PID=$!

# 等待微服务启动
sleep 5

echo "🌐 启动 API Gateway (端口: 4000)..."
npm run start:gateway &
GATEWAY_PID=$!

echo "✅ 所有服务已启动"
echo "📊 服务状态:"
echo "   - API Gateway: http://localhost:4000"
echo "   - Monitor Service: localhost:4001"
echo "   - Transaction Service: localhost:4002"
echo "   - Wallet Service: localhost:4003"
echo "   - Block Service: localhost:4004"
echo "📚 API文档: http://localhost:4000/api-docs"

# 等待用户中断
echo ""
echo "按 Ctrl+C 停止所有服务"
wait 