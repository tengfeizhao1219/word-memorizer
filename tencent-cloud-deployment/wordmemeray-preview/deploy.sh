#!/bin/bash

# WordMemeray预览页面一键部署脚本
# 使用方法: ./deploy.sh [你的GitHub用户名]

set -e

echo "🚀 WordMemeray预览页面一键部署脚本"
echo "======================================"

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 请提供你的GitHub用户名"
    echo "使用方法: ./deploy.sh [你的GitHub用户名]"
    echo "示例: ./deploy.sh tengfeizhao1219"
    exit 1
fi

GITHUB_USERNAME="$1"
REPO_NAME="wordmemeray-preview"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
PAGES_URL="https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/"

echo "📋 部署信息:"
echo "  GitHub用户名: ${GITHUB_USERNAME}"
echo "  仓库名称: ${REPO_NAME}"
echo "  最终URL: ${PAGES_URL}"
echo ""

# 检查git是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git未安装，请先安装Git"
    echo "Ubuntu/Debian: sudo apt-get install git"
    echo "macOS: brew install git"
    echo "Windows: 下载 Git for Windows"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "index.html" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 准备部署文件..."
# 确保所有文件可读
chmod -R a+r .

echo "🔧 配置Git..."
git config --local user.email "${GITHUB_USERNAME}@users.noreply.github.com"
git config --local user.name "${GITHUB_USERNAME}"

echo "🔄 创建GitHub仓库..."
echo "请按照以下步骤操作:"
echo ""
echo "1. 访问 https://github.com/new"
echo "2. 创建新仓库:"
echo "   - 仓库名称: ${REPO_NAME}"
echo "   - 描述: WordMemeray风格首页预览"
echo "   - 选择: Public (公开)"
echo "   - 不要初始化README、.gitignore或license"
echo "3. 创建仓库后，你会看到快速设置页面"
echo ""
read -p "按回车键继续，当你创建好仓库后..."

echo ""
echo "📤 推送到GitHub..."
echo "请复制并执行以下命令:"
echo ""
echo "1. 添加远程仓库:"
echo "   git remote add origin ${REPO_URL}"
echo ""
echo "2. 重命名分支为main（如果需要）:"
echo "   git branch -M main"
echo ""
echo "3. 推送到GitHub:"
echo "   git push -u origin main"
echo ""
read -p "按回车键继续，当你执行完上述命令后..."

echo ""
echo "🌐 启用GitHub Pages..."
echo "请按照以下步骤操作:"
echo ""
echo "1. 访问: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/pages"
echo "2. 在'Source'部分:"
echo "   - 选择: Deploy from a branch"
echo "   - 分支: main"
echo "   - 文件夹: / (root)"
echo "3. 点击 Save"
echo ""
echo "📱 等待部署完成..."
echo "部署通常需要1-2分钟"
echo "完成后访问: ${PAGES_URL}"
echo ""
echo "✅ 部署完成！"
echo ""
echo "🎯 测试你的页面:"
echo "1. 主页面: ${PAGES_URL}"
echo "2. 测试页面: ${PAGES_URL}test.html"
echo ""
echo "🔧 故障排除:"
echo "如果页面无法访问:"
echo "1. 检查仓库是否为公开"
echo "2. 检查GitHub Pages设置"
echo "3. 等待几分钟后重试"
echo ""
echo "📞 更多帮助:"
echo "查看 DEPLOYMENT_GUIDE.md 获取详细指南"
echo "或运行: cat DEPLOYMENT_GUIDE.md"