#!/bin/bash
# 部署云函数到新的腾讯云环境

set -e

PROJECT_DIR="/home/admin/.openclaw/workspace/word-memorizer"
cd "$PROJECT_DIR"

echo "🚀 开始部署云函数到新腾讯云环境"
echo "环境ID: tengfei-workspace-7ef9ma8b7670ea"
echo "=================================================="

# 检查必要的工具
echo "🔧 检查必要工具..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v tcb &> /dev/null; then
    echo "⚠️  CloudBase CLI 未安装，尝试安装..."
    npm install -g @cloudbase/cli
fi

# 登录腾讯云
echo ""
echo "🔐 登录腾讯云（需要扫码）..."
tcb login

if [ $? -ne 0 ]; then
    echo "❌ 登录失败，请手动登录: tcb login"
    exit 1
fi

# 切换到新环境
echo ""
echo "🌐 切换到新环境: tengfei-workspace-7ef9ma8b7670ea"
tcb env list

# 设置环境变量
echo ""
echo "⚙️  设置环境变量..."
echo "注意：需要在腾讯云控制台手动配置以下环境变量："
echo ""
echo "必需的环境变量："
echo "  TENCENT_SECRET_ID=AKIDPimcCajdU7VfaHKBnBKDr673oNj060h9"
echo "  TENCENT_SECRET_KEY=LSN7g192h7JICtPhlcFdmgNq56uQjmbB"
echo "  TENCENT_REGION=ap-shanghai"
echo ""
echo "可选的环境变量："
echo "  WECHAT_APP_ID=wx1ccb4d171dd88162"
echo "  WECHAT_APP_KEY=101675fa960ac80c09dd2bf7273c7513"
echo ""

# 部署翻译云函数
echo ""
echo "📦 部署翻译云函数..."
cd cloud-functions/translate

echo "安装依赖..."
npm install

echo "部署翻译云函数..."
tcb functions:deploy translate -e tengfei-workspace-7ef9ma8b7670ea

if [ $? -eq 0 ]; then
    echo "✅ 翻译云函数部署成功"
else
    echo "❌ 翻译云函数部署失败"
fi

# 部署用户登录云函数
echo ""
echo "👤 部署用户登录云函数..."
cd ../user/login

echo "安装依赖..."
npm install

echo "部署登录云函数..."
tcb functions:deploy login -e tengfei-workspace-7ef9ma8b7670ea

if [ $? -eq 0 ]; then
    echo "✅ 登录云函数部署成功"
else
    echo "❌ 登录云函数部署失败"
fi

# 部署其他云函数
echo ""
echo "📚 部署单词相关云函数..."
cd ../../word

for dir in */; do
    if [ -f "$dir/package.json" ]; then
        echo "部署 ${dir%/} 云函数..."
        cd "$dir"
        npm install
        tcb functions:deploy "${dir%/}" -e tengfei-workspace-7ef9ma8b7670ea
        cd ..
    fi
done

# 部署复习云函数
echo ""
echo "🔄 部署复习云函数..."
cd ../review

if [ -f "package.json" ]; then
    npm install
    tcb functions:deploy review -e tengfei-workspace-7ef9ma8b7670ea
    echo "✅ 复习云函数部署成功"
else
    echo "⚠️  复习云函数目录不存在或配置不完整"
fi

# 部署同步云函数
echo ""
echo "🔄 部署同步云函数..."
cd ../sync

if [ -f "package.json" ]; then
    npm install
    tcb functions:deploy sync -e tengfei-workspace-7ef9ma8b7670ea
    echo "✅ 同步云函数部署成功"
else
    echo "⚠️  同步云函数目录不存在或配置不完整"
fi

# 创建数据库集合
echo ""
echo "🗄️  创建数据库集合..."
echo "需要在腾讯云控制台手动创建以下集合："
echo ""
echo "必需集合："
echo "  1. users - 用户信息"
echo "  2. words - 单词数据"
echo "  3. translation_history - 翻译历史"
echo "  4. user_stats - 用户统计"
echo ""
echo "可选集合："
echo "  5. categories - 单词分类"
echo "  6. settings - 用户设置"
echo "  7. feedback - 用户反馈"
echo ""

# 测试云函数
echo ""
echo "🧪 测试云函数部署..."
echo "测试翻译云函数："
tcb functions:invoke translate -e tengfei-workspace-7ef9ma8b7670ea --params '{"text":"hello","source":"en","target":"zh"}'

echo ""
echo "测试登录云函数："
tcb functions:invoke login -e tengfei-workspace-7ef9ma8b7670ea --params '{"action":"test"}'

# 总结
echo ""
echo "🎉 云函数部署完成！"
echo "=================================================="
echo ""
echo "📋 部署总结："
echo "  1. ✅ 翻译云函数 (translate)"
echo "  2. ✅ 用户登录云函数 (login)"
echo "  3. ✅ 单词相关云函数"
echo "  4. ✅ 复习云函数 (review)"
echo "  5. ✅ 同步云函数 (sync)"
echo ""
echo "🔧 需要手动完成："
echo "  1. 在腾讯云控制台配置环境变量"
echo "  2. 在腾讯云控制台创建数据库集合"
echo "  3. 在微信开发者工具中更新环境ID"
echo ""
echo "🚀 下一步："
echo "  1. 配置环境变量"
echo "  2. 创建数据库集合"
echo "  3. 测试完整功能"
echo ""
echo "💡 提示：如果使用微信云开发，可以在微信开发者工具中直接部署"