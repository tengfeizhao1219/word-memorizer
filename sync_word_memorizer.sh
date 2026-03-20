#!/bin/bash
# 单词本项目Git同步脚本

set -e

PROJECT_DIR="/home/admin/.openclaw/workspace/word-memorizer"
cd "$PROJECT_DIR"

echo "🚀 开始同步单词本项目到GitHub..."
echo "仓库: https://github.com/tengfeizhao1219/word-memorizer"
echo "=================================================="

# 检查Git状态
echo "📊 检查Git状态..."
if ! git status --porcelain | grep -q .; then
    echo "📭 没有检测到文件更改"
    exit 0
fi

# 显示更改摘要
echo "📝 检测到以下类型的更改:"
git status --porcelain | awk '{print $1 " " $2}' | sort | uniq -c | while read count type; do
    echo "  $count 个 $type 文件"
done

# 显示主要更改的文件
echo ""
echo "📋 主要更改的文件:"
git status --porcelain | head -10 | while read status file; do
    echo "  $status $(basename "$file")"
done

TOTAL_CHANGES=$(git status --porcelain | wc -l)
if [ $TOTAL_CHANGES -gt 10 ]; then
    echo "  ... 还有 $(($TOTAL_CHANGES - 10)) 个文件"
fi

# 生成提交信息
COMMIT_MSG=""
if [ $# -gt 0 ]; then
    COMMIT_MSG="$*"
else
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    COMMIT_MSG="更新单词本系统: $TIMESTAMP - 修复技术问题 + 腾讯云环境配置"
fi

echo ""
echo "💾 提交更改: $COMMIT_MSG"
echo "--------------------------------------------------"

# 添加所有更改
echo "➕ 添加文件到暂存区..."
git add .

# 提交
git commit -m "$COMMIT_MSG"

echo "✅ 提交完成: $(git log -1 --oneline)"

# 推送到GitHub
echo ""
echo "🚀 推送到GitHub..."
echo "--------------------------------------------------"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"

# 尝试推送
if git push origin $CURRENT_BRANCH; then
    echo "✅ 推送成功！"
    echo ""
    echo "🌐 GitHub仓库地址: https://github.com/tengfeizhao1219/word-memorizer"
    echo "📊 查看提交: https://github.com/tengfeizhao1219/word-memorizer/commits/$CURRENT_BRANCH"
else
    echo "⚠️  推送失败，尝试拉取并合并..."
    
    # 先拉取
    if git pull --rebase origin $CURRENT_BRANCH; then
        echo "✅ 拉取并合并成功，重新推送..."
        if git push origin $CURRENT_BRANCH; then
            echo "✅ 推送成功！"
        else
            echo "❌ 重新推送失败，请手动解决"
            echo ""
            echo "🔧 手动解决步骤:"
            echo "   1. cd $PROJECT_DIR"
            echo "   2. git pull --rebase origin $CURRENT_BRANCH"
            echo "   3. 解决冲突（如果有）"
            echo "   4. git push origin $CURRENT_BRANCH"
            exit 1
        fi
    else
        echo "❌ 拉取失败，请手动解决冲突"
        echo ""
        echo "🔧 手动解决步骤:"
        echo "   1. cd $PROJECT_DIR"
        echo "   2. git status  # 查看冲突文件"
        echo "   3. 编辑冲突文件解决冲突"
        echo "   4. git add ."
        echo "   5. git rebase --continue"
        echo "   6. git push origin $CURRENT_BRANCH"
        exit 1
    fi
fi

echo ""
echo "🎉 单词本项目同步完成！"
echo "=================================================="
echo ""
echo "📌 项目状态汇总:"
echo "   1. ✅ 腾讯云环境配置更新"
echo "   2. ✅ 小程序页面文件创建"
echo "   3. ✅ 测试工具完善"
echo "   4. ✅ Git自动同步配置"
echo ""
echo "🔗 相关链接:"
echo "   - GitHub: https://github.com/tengfeizhao1219/word-memorizer"
echo "   - 腾讯云环境: tengfei-workspace-7ef9ma8b7670ea"
echo "   - 微信AppID: wx1ccb4d171dd88162"
echo ""
echo "🚀 下一步: 测试新环境连接，开始翻译功能开发"