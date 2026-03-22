#!/bin/bash

# 部署WordMemeray预览页面到现有GitHub仓库

echo "🚀 WordMemeray预览页面部署到现有仓库"
echo "======================================"

REPO_URL="https://github.com/tengfeizhao1219/Tengfei-s-Workstation.git"
BRANCH_NAME="wordmemeray-preview"
TARGET_DIR="wordmemeray-preview"

echo "📋 部署信息:"
echo "  仓库: $REPO_URL"
echo "  分支: $BRANCH_NAME"
echo "  目录: $TARGET_DIR"
echo "  最终URL: https://tengfeizhao1219.github.io/Tengfei-s-Workstation/$TARGET_DIR/"

# 克隆仓库到临时目录
TEMP_DIR="/tmp/wordmemeray-deploy-$(date +%s)"
echo "📦 克隆仓库到临时目录: $TEMP_DIR"
git clone --depth 1 "$REPO_URL" "$TEMP_DIR" 2>/dev/null || {
    echo "❌ 克隆仓库失败"
    exit 1
}

cd "$TEMP_DIR"

# 创建新分支
echo "🌿 创建新分支: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME" 2>/dev/null || {
    echo "⚠️  分支已存在，切换到现有分支"
    git checkout "$BRANCH_NAME"
}

# 创建目标目录
echo "📁 创建目标目录: $TARGET_DIR"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# 复制WordMemeray预览文件
echo "📤 复制WordMemeray预览文件..."
cp -r /home/admin/.openclaw/workspace/wordmemeray-preview/* "$TARGET_DIR/"

# 创建GitHub Pages配置
echo "⚙️  创建GitHub Pages配置..."
cat > "$TARGET_DIR/.nojekyll" << EOF
# 禁用Jekyll处理
EOF

cat > "$TARGET_DIR/CNAME" << EOF
# 自定义域名（可选）
EOF

# 提交更改
echo "💾 提交更改..."
git add "$TARGET_DIR/"
git commit -m "添加WordMemeray预览页面 $(date)" 2>/dev/null || {
    echo "⚠️  没有更改需要提交"
}

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin "$BRANCH_NAME" 2>&1 | head -20

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功!"
    echo ""
    echo "🌐 访问URL:"
    echo "   https://tengfeizhao1219.github.io/Tengfei-s-Workstation/$TARGET_DIR/"
    echo ""
    echo "📋 手动启用GitHub Pages:"
    echo "   1. 访问 https://github.com/tengfeizhao1219/Tengfei-s-Workstation"
    echo "   2. 点击 Settings → Pages"
    echo "   3. 在 Source 选择:"
    echo "      - Branch: $BRANCH_NAME"
    echo "      - Folder: /$TARGET_DIR"
    echo "   4. 点击 Save"
    echo "   5. 等待1-2分钟部署完成"
    echo ""
    echo "🔗 直接访问链接:"
    echo "   https://tengfeizhao1219.github.io/Tengfei-s-Workstation/$TARGET_DIR/"
else
    echo ""
    echo "❌ 推送失败，需要GitHub认证"
    echo ""
    echo "📋 手动部署步骤:"
    echo "   1. 访问 https://github.com/tengfeizhao1219/Tengfei-s-Workstation"
    echo "   2. 创建新分支: $BRANCH_NAME"
    echo "   3. 创建目录: $TARGET_DIR"
    echo "   4. 上传WordMemeray预览文件"
    echo "   5. 启用GitHub Pages"
    echo ""
    echo "📁 文件位置: /home/admin/.openclaw/workspace/wordmemeray-preview/"
fi

# 清理临时目录
cd /tmp
rm -rf "$TEMP_DIR"

echo ""
echo "🎯 立即测试本地预览:"
echo "   访问: http://localhost:8083/gist-deploy.html"
echo ""