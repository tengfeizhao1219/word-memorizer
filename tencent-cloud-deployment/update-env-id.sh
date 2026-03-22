#!/bin/bash

echo "🔄 更新所有配置文件中的环境ID"
echo "============================="

OLD_ENV_IDS=(
    "tengfei-workspace-7ef9ma8b7670ea"
    "tengfei-workstation-7czc7ab13ca3"
    "tengfei-workspace-7ef9ma8b7670ea"
)

NEW_ENV_ID="cloud1-1g9313w0bb791de0"

echo "📋 更新信息:"
echo "   旧环境ID: ${OLD_ENV_IDS[@]}"
echo "   新环境ID: $NEW_ENV_ID"
echo "   工作目录: /home/admin/.openclaw/workspace"

# 更新word-memorizer目录
echo ""
echo "📁 更新word-memorizer目录..."
cd /home/admin/.openclaw/workspace/word-memorizer

for old_id in "${OLD_ENV_IDS[@]}"; do
    echo "   替换: $old_id → $NEW_ENV_ID"
    find . -type f \( -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.py" -o -name "*.txt" \) \
        -exec grep -l "$old_id" {} \; 2>/dev/null | while read file; do
        echo "      - 更新: $file"
        sed -i "s/$old_id/$NEW_ENV_ID/g" "$file"
    done
done

# 更新tencent_cloud_config.md
echo ""
echo "📄 更新腾讯云配置文档..."
CONFIG_FILE="tencent_cloud_config.md"
if [ -f "$CONFIG_FILE" ]; then
    echo "   更新: $CONFIG_FILE"
    sed -i "s/tengfei-workspace-7ef9ma8b7670ea/$NEW_ENV_ID/g" "$CONFIG_FILE"
    sed -i "s/tengfei-workstation-7czc7ab13ca3/$NEW_ENV_ID/g" "$CONFIG_FILE"
    
    # 更新环境信息部分
    sed -i "0,/环境ID:/{s/环境ID:.*/环境ID: \`$NEW_ENV_ID\`/}" "$CONFIG_FILE"
fi

# 更新setup_env_vars.py
echo ""
echo "🐍 更新Python环境变量脚本..."
PY_FILE="setup_env_vars.py"
if [ -f "$PY_FILE" ]; then
    echo "   更新: $PY_FILE"
    sed -i "s/tengfei-workspace-7ef9ma8b7670ea/$NEW_ENV_ID/g" "$PY_FILE"
    sed -i "s/tengfei-workstation-7czc7ab13ca3/$NEW_ENV_ID/g" "$PY_FILE"
fi

# 更新云函数代码
echo ""
echo "⚡ 更新云函数代码..."
CLOUD_FUNCTIONS=(
    "cloudfunctions/translate/index.js"
    "cloudfunctions/user/login/index.js"
    "cloudfunctions/word/list/index.js"
)

for func in "${CLOUD_FUNCTIONS[@]}"; do
    if [ -f "$func" ]; then
        echo "   更新: $func"
        sed -i "s/tengfei-workspace-7ef9ma8b7670ea/$NEW_ENV_ID/g" "$func"
        sed -i "s/tengfei-workstation-7czc7ab13ca3/$NEW_ENV_ID/g" "$func"
    fi
done

# 更新前端配置
echo ""
echo "📱 更新前端配置..."
FRONTEND_FILES=(
    "client-mini-wechat/app.js"
    "client-mini-wechat/project.config.json"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   更新: $file"
        sed -i "s/tengfei-workspace-7ef9ma8b7670ea/$NEW_ENV_ID/g" "$file"
        sed -i "s/tengfei-workstation-7czc7ab13ca3/$NEW_ENV_ID/g" "$file"
    fi
done

echo ""
echo "✅ 环境ID更新完成!"
echo ""
echo "📋 验证更新结果:"
echo "   当前环境ID: $NEW_ENV_ID"
echo ""
echo "🔍 检查关键文件:"
grep -n "cloud1-1g9313w0bb791de0" tencent_cloud_config.md 2>/dev/null | head -5
echo ""
echo "🚀 下一步: 直接配置云函数和数据库"