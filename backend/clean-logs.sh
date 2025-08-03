#!/bin/bash

echo "🧹 日志清理工具"
echo "================"

# 检查logs目录是否存在
if [ ! -d "logs" ]; then
    echo "❌ logs目录不存在"
    exit 1
fi

echo "📁 当前日志文件："
ls -la logs/sql-*.log 2>/dev/null || echo "没有找到SQL日志文件"

echo ""
echo "🗑️  清理选项："
echo "1. 清理所有日志文件"
echo "2. 清理7天前的日志文件"
echo "3. 清理30天前的日志文件"
echo "4. 只清理今天的日志文件"
echo "5. 退出"

read -p "请选择操作 (1-5): " choice

case $choice in
    1)
        echo "🗑️  清理所有日志文件..."
        rm -f logs/sql-*.log
        echo "✅ 所有日志文件已清理"
        ;;
    2)
        echo "🗑️  清理7天前的日志文件..."
        find logs/ -name "sql-*.log" -mtime +7 -delete
        echo "✅ 7天前的日志文件已清理"
        ;;
    3)
        echo "🗑️  清理30天前的日志文件..."
        find logs/ -name "sql-*.log" -mtime +30 -delete
        echo "✅ 30天前的日志文件已清理"
        ;;
    4)
        echo "🗑️  清理今天的日志文件..."
        TODAY=$(date +%Y-%m-%d)
        rm -f logs/sql-${TODAY}.log
        echo "✅ 今天的日志文件已清理"
        ;;
    5)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "📁 清理后的日志文件："
ls -la logs/sql-*.log 2>/dev/null || echo "没有找到SQL日志文件" 