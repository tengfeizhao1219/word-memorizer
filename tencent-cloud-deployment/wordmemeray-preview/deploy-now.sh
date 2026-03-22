#!/bin/bash

# WordMemeray预览页面立即部署脚本

echo "🚀 WordMemeray预览页面立即部署"
echo "======================================"

# 设置Git配置
echo "🔧 配置Git..."
git config --global user.name "WordMemeray Deploy"
git config --global user.email "deploy@wordmemeray.com"

# 创建临时GitHub仓库
REPO_NAME="WordMemeray-preview-$(date +%s)"
echo "📦 创建仓库: $REPO_NAME"

# 创建本地仓库
cd /home/admin/.openclaw/workspace/wordmemeray-preview

# 确保所有文件已提交
git add .
git commit -m "部署WordMemeray预览页面 $(date)" || true

# 创建裸仓库用于推送
TEMP_DIR="/tmp/$REPO_NAME"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"
git init --bare

# 从源仓库推送
cd /home/admin/.openclaw/workspace/wordmemeray-preview
git push "$TEMP_DIR" master

echo "✅ 本地仓库准备完成"
echo ""
echo "📋 手动部署步骤:"
echo "1. 访问 https://github.com/new"
echo "2. 创建新仓库:"
echo "   - 名称: WordMemeray-preview"
echo "   - 描述: WordMemeray风格首页预览"
echo "   - 选择: Public"
echo "   - 不要初始化任何文件"
echo "3. 创建后，复制仓库URL"
echo "4. 运行以下命令推送:"
echo ""
echo "cd /home/admin/.openclaw/workspace/wordmemeray-preview"
echo "git remote add origin [你的仓库URL]"
echo "git push -u origin master"
echo ""
echo "5. 启用GitHub Pages:"
echo "   - 仓库设置 → Pages → 选择master分支 → 保存"
echo ""
echo "🌐 部署完成后访问: https://[你的用户名].github.io/WordMemeray-preview/"