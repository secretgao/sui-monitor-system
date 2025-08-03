#!/bin/bash

echo "🔧 安装Sui链监控系统依赖..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version
npm --version

# 清理缓存
echo "🧹 清理npm缓存..."
npm cache clean --force

# 删除现有的node_modules和lock文件
echo "🗑️  清理现有依赖..."
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 安装后端依赖
echo "🔧 安装后端依赖..."
cd backend
npm install
cd ..

# 安装前端依赖
echo "🎨 安装前端依赖..."
cd frontend
npm install
cd ..

echo "✅ 依赖安装完成！"
echo ""
echo "🚀 现在可以启动服务："
echo "   npm run dev"
echo ""
echo "或者使用Docker启动PostgreSQL："
echo "   docker-compose up -d" 