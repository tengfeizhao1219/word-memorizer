#!/bin/bash

# 单词本学习系统 - 本地一键启动脚本

echo "========================================"
echo "🚀 单词本学习系统 - 本地部署启动"
echo "========================================"
echo "时间: $(date)"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js版本: $NODE_VERSION"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 安装依赖
echo ""
echo "📦 安装依赖..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ 依赖已安装，跳过安装步骤"
fi

# 启动本地服务器
echo ""
echo "🌐 启动本地API服务器..."
echo "----------------------------------------"

# 检查端口是否被占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 $PORT 已被占用，尝试停止现有进程..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动服务器
node local-server/server.js &
SERVER_PID=$!

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 3

# 检查服务器是否启动成功
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 本地API服务器启动成功!"
    echo "📡 地址: http://localhost:3000"
else
    echo "❌ 服务器启动失败，请检查错误信息"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 测试API
echo ""
echo "🧪 测试API接口..."
node local-server/test-api.js

if [ $? -eq 0 ]; then
    echo "✅ API测试通过!"
else
    echo "⚠️  API测试失败，但服务器仍在运行"
fi

echo ""
echo "========================================"
echo "🎉 本地部署完成！"
echo "========================================"
echo ""
echo "📋 下一步操作："
echo "1. 📱 打开微信开发者工具"
echo "2. 📁 导入项目: client-mini-wechat/"
echo "3. ⚙️  设置: 详情 → 本地设置 → 不校验合法域名"
echo "4. 🚀 点击'编译'运行小程序"
echo ""
echo "💡 提示："
echo "- 本地服务器PID: $SERVER_PID"
echo "- 停止服务器: kill $SERVER_PID"
echo "- 查看日志: tail -f 本地服务器控制台输出"
echo ""
echo "📚 详细指南请查看: LOCAL_DEPLOYMENT_GUIDE.md"
echo "========================================"

# 保持脚本运行
echo ""
echo "🔄 服务器运行中... (按 Ctrl+C 停止)"
wait $SERVER_PID