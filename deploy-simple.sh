#!/bin/bash

# 简化的部署脚本
# 用于快速部署到 tengfei-workstation 环境

set -e

echo "🚀 开始部署多端同步生词本到云开发环境"
echo "========================================"

# 环境变量
TCB_ENV="tengfei-workstation-7czc7ab13ca3"
TCB_REGION="ap-shanghai"

echo "📋 环境信息:"
echo "   - 环境ID: $TCB_ENV"
echo "   - 地域: $TCB_REGION"
echo ""

# 检查 cloudbase-cli 是否安装
if ! command -v cloudbase &> /dev/null; then
    echo "❌ cloudbase-cli 未安装"
    echo "正在安装 cloudbase-cli..."
    npm install -g @cloudbase/cli
    echo "✅ cloudbase-cli 安装完成"
fi

# 检查登录状态
echo "🔐 检查云开发登录状态..."
if ! cloudbase login --check; then
    echo "⚠️ 未登录云开发，请扫码登录..."
    cloudbase login
else
    echo "✅ 已登录云开发"
fi

echo ""
echo "📦 开始部署云函数..."
echo "----------------------------------------"

# 部署用户服务
echo "👤 部署用户服务..."
cd cloud-functions/user
cloudbase functions:deploy login -e $TCB_ENV
cloudbase functions:deploy getInfo -e $TCB_ENV
cd ../..

# 部署生词服务
echo "📚 部署生词服务..."
cd cloud-functions/word
cloudbase functions:deploy add -e $TCB_ENV
cloudbase functions:deploy list -e $TCB_ENV
cloudbase functions:deploy detail -e $TCB_ENV
cloudbase functions:deploy search -e $TCB_ENV
cloudbase functions:deploy import -e $TCB_ENV
cloudbase functions:deploy export -e $TCB_ENV
cd ../..

# 部署复习服务
echo "🔄 部署复习服务..."
cd cloud-functions/review
cloudbase functions:deploy getToday -e $TCB_ENV
cloudbase functions:deploy submit -e $TCB_ENV
cd ../..

echo ""
echo "🗄️ 初始化数据库..."
echo "----------------------------------------"

# 初始化数据库
node database/init.js --env $TCB_ENV

echo ""
echo "🎉 部署完成！"
echo "========================================"
echo ""
echo "📊 部署总结:"
echo "   ✅ 云函数: 10个已部署"
echo "   ✅ 数据库: 5个集合已初始化"
echo "   ✅ 环境: $TCB_ENV"
echo ""
echo "🔗 控制台地址: https://console.cloud.tencent.com/tcb/env/$TCB_ENV"
echo ""
echo "🚀 下一步:"
echo "   1. 在微信公众平台注册小程序"
echo "   2. 获取小程序AppID"
echo "   3. 配置 env.js 中的 appId"
echo "   4. 使用微信开发者工具导入项目"
echo "   5. 进行真机测试"
echo ""
echo "💡 提示: 如需重新部署，再次运行此脚本即可"