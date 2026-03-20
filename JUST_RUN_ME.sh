#!/bin/bash
# 🚀 终极简单部署脚本 - 只需要运行这一个文件

set -e

echo ""
echo "=================================================="
echo "🚀 单词本云函数一键部署脚本"
echo "=================================================="
echo ""

# 检查是否在正确目录
if [ ! -f "cloud-functions/translate/index.js" ]; then
    echo "❌ 错误：请在 word-memorizer 目录下运行此脚本"
    echo "当前目录：$(pwd)"
    exit 1
fi

# 显示重要信息
echo "📋 部署信息："
echo "  • 环境ID: tengfei-workspace-7ef9ma8b7670ea"
echo "  • 微信AppID: wx1ccb4d171dd88162"
echo "  • 目标：部署翻译等云函数"
echo ""

# 检查必要工具
echo "🔧 检查工具..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 Node.js"
    echo "  访问：https://nodejs.org/"
    exit 1
fi
echo "  ✅ npm 已安装"

if ! command -v tcb &> /dev/null; then
    echo "⚠️  CloudBase CLI 未安装，正在安装..."
    npm install -g @cloudbase/cli
    if [ $? -ne 0 ]; then
        echo "❌ CloudBase CLI 安装失败"
        echo "  请手动运行：npm install -g @cloudbase/cli"
        exit 1
    fi
    echo "  ✅ CloudBase CLI 安装成功"
else
    echo "  ✅ CloudBase CLI 已安装"
fi

# 登录腾讯云
echo ""
echo "🔐 登录腾讯云（需要扫码）..."
echo "=================================================="
echo "请使用微信扫描二维码登录"
echo "如果已经登录过，可以按 Ctrl+C 跳过"
echo "=================================================="
echo ""

tcb login
LOGIN_RESULT=$?

if [ $LOGIN_RESULT -ne 0 ]; then
    echo "⚠️  登录可能有问题，继续尝试部署..."
fi

# 部署翻译云函数（最高优先级）
echo ""
echo "📦 部署翻译云函数（最高优先级）..."
echo "=================================================="

cd cloud-functions/translate

echo "安装依赖..."
npm install --silent

echo "部署到环境：tengfei-workspace-7ef9ma8b7670ea"
tcb functions:deploy translate -e tengfei-workspace-7ef9ma8b7670ea

if [ $? -eq 0 ]; then
    echo "✅ 翻译云函数部署成功！"
else
    echo "❌ 翻译云函数部署失败"
    echo "尝试简化部署..."
    tcb fn deploy translate -e tengfei-workspace-7ef9ma8b7670ea
fi

cd ../..

# 显示环境变量配置指南
echo ""
echo "=================================================="
echo "🔥 重要：环境变量配置（必须完成）"
echo "=================================================="
echo ""
echo "请在腾讯云控制台配置以下环境变量："
echo ""
echo "TENCENT_SECRET_ID = AKIDPimcCajdU7VfaHKBnBKDr673oNj060h9"
echo "TENCENT_SECRET_KEY = LSN7g192h7JICtPhlcFdmgNq56uQjmbB"
echo "TENCENT_REGION = ap-shanghai"
echo ""
echo "配置步骤："
echo "1. 访问 https://console.cloud.tencent.com/tcb"
echo "2. 选择环境：tengfei-workspace-7ef9ma8b7670ea"
echo "3. 进入'环境配置' → '环境变量'"
echo "4. 添加上面的3个变量"
echo "5. 保存配置"
echo "6. 重新部署云函数（环境变量需要重启生效）"
echo ""

# 显示测试指南
echo ""
echo "=================================================="
echo "🧪 立即测试指南"
echo "=================================================="
echo ""
echo "测试步骤："
echo "1. 打开微信开发者工具"
echo "2. 导入项目：word-memorizer/client-mini-wechat"
echo "3. 设置AppID：wx1ccb4d171dd88162"
echo "4. 点击'云开发'按钮，选择环境"
echo "5. 访问页面：pages/translate/translate"
echo "6. 输入'hello'，点击翻译"
echo ""
echo "预期结果："
echo "✅ 成功：显示'腾讯云翻译'和'你好'"
echo "⚠️  警告：显示'本地词典'（环境变量未生效）"
echo "❌ 失败：显示错误信息"
echo ""

# 可选：部署其他云函数
echo ""
echo "=================================================="
echo "📚 可选：部署其他云函数"
echo "=================================================="
echo ""
read -p "是否继续部署其他云函数？(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "部署用户登录云函数..."
    cd cloud-functions/user/login
    npm install --silent
    tcb functions:deploy login -e tengfei-workspace-7ef9ma8b7670ea
    cd ../../..
    
    echo ""
    echo "部署单词管理云函数..."
    for dir in cloud-functions/word/*/; do
        if [ -f "$dir/package.json" ]; then
            func_name=$(basename "$dir")
            echo "部署 $func_name..."
            cd "$dir"
            npm install --silent
            tcb functions:deploy "$func_name" -e tengfei-workspace-7ef9ma8b7670ea
            cd ../../..
        fi
    done
fi

# 最终总结
echo ""
echo "=================================================="
echo "🎉 部署完成！"
echo "=================================================="
echo ""
echo "📋 下一步操作："
echo "  1. 🔥 立即配置环境变量（必须）"
echo "  2. 🧪 测试翻译功能（5分钟）"
echo "  3. 📱 根据测试结果决定后续"
echo ""
echo "⏰ 时间安排："
echo "  • 现在：配置环境变量"
echo "  • 19:10：测试翻译功能"
echo "  • 19:15：根据结果决定下一步"
echo ""
echo "💡 提示：先让核心翻译功能跑起来，其他逐步完善"
echo ""
echo "📞 如有问题，请提供："
echo "  • 错误信息截图"
echo "  • 云函数日志内容"
echo "  • 测试结果截图"
echo ""
echo "=================================================="