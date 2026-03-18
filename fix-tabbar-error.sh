#!/bin/bash
# 自动修复tabBar图标缺失错误
# 移除app.json中的tabBar配置

echo "🔧 开始修复tabBar图标缺失错误"
echo "========================================"

# 需要修复的文件列表
FILES_TO_FIX=(
  "wechat-mini-complete/app.json"
  "client-mini-wechat/app.json"
  "client-mini/app.json"
)

# 修复计数器
FIXED_COUNT=0
TOTAL_FILES=${#FILES_TO_FIX[@]}

echo "📁 需要检查 $TOTAL_FILES 个文件"

for file in "${FILES_TO_FIX[@]}"; do
  if [ -f "$file" ]; then
    echo ""
    echo "📄 检查文件: $file"
    
    # 检查是否包含tabBar配置
    if grep -q '"tabBar"' "$file"; then
      echo "  ❌ 发现tabBar配置，需要修复"
      
      # 创建备份
      cp "$file" "$file.backup.$(date +%Y%m%d%H%M%S)"
      echo "  💾 已创建备份: $file.backup"
      
      # 使用Python移除tabBar配置
      python3 -c "
import json
import sys

try:
    with open('$file', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 移除tabBar配置
    if 'tabBar' in data:
        del data['tabBar']
        print('  ✅ 已移除tabBar配置')
    
    # 写回文件
    with open('$file', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print('  ✅ 文件已修复')
    FIXED_COUNT=$((FIXED_COUNT + 1))
    
except Exception as e:
    print(f'  ❌ 修复失败: {e}')
    sys.exit(1)
"
    else
      echo "  ✅ 文件正常，无需修复"
    fi
  else
    echo "  ⚠️ 文件不存在: $file"
  fi
done

echo ""
echo "========================================"
echo "🎯 修复完成"
echo "✅ 修复了 $FIXED_COUNT/$TOTAL_FILES 个文件"
echo ""
echo "🚀 下一步操作:"
echo "1. 重新编译微信小程序"
echo "2. 验证错误是否消失"
echo "3. 测试基本功能"
echo ""
echo "💡 如果还有问题，请提供新的错误信息"