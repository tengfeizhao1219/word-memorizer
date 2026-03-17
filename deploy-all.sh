#!/bin/bash

# 批量部署所有云函数
# 使用 --yes 参数跳过交互确认

set -e

echo "🚀 开始批量部署所有云函数"
echo "========================================"
echo "环境: tengfei-workstation-7czc7ab13ca3"
echo ""

# 函数列表
functions=(
  "user/getInfo"
  "word/add"
  "word/list" 
  "word/detail"
  "word/search"
  "word/import"
  "word/export"
  "review/getToday"
  "review/submit"
)

# 已经部署的函数
deployed=("user/login")

# 部署计数器
success_count=0
fail_count=0

# 部署函数
deploy_function() {
  local func_path=$1
  local func_name=$(basename $func_path)
  
  echo ""
  echo "📦 部署 $func_name..."
  echo "   路径: $func_path"
  
  # 进入目录
  cd "$func_path"
  
  # 部署命令
  echo "   执行: npx tcb fn deploy $func_name -e tengfei-workstation-7czc7ab13ca3 --yes"
  
  # 执行部署
  if npx tcb fn deploy "$func_name" -e tengfei-workstation-7czc7ab13ca3 --yes 2>&1 | tee /tmp/deploy.log; then
    if grep -q "deployed successfully" /tmp/deploy.log || grep -q "部署成功" /tmp/deploy.log; then
      echo "   ✅ $func_name 部署成功"
      deployed+=("$func_name")
      ((success_count++))
    else
      echo "   ⚠️ $func_name 部署可能有问题，检查日志"
      ((fail_count++))
    fi
  else
    echo "   ❌ $func_name 部署失败"
    ((fail_count++))
  fi
  
  # 返回项目根目录
  cd - > /dev/null
  
  # 延迟避免请求过快
  sleep 3
}

# 主部署循环
echo "开始部署 ${#functions[@]} 个云函数..."
echo "----------------------------------------"

for func in "${functions[@]}"; do
  deploy_function "cloud-functions/$func"
done

echo ""
echo "========================================"
echo "📊 部署完成统计:"
echo "   成功: $success_count"
echo "   失败: $fail_count"
echo "   总计: $((success_count + fail_count))"
echo ""
echo "✅ 已部署函数:"
for func in "${deployed[@]}"; do
  echo "   - $func"
done

# 初始化数据库
echo ""
echo "🗄️ 初始化数据库..."
if node database/init.js --env tengfei-workstation-7czc7ab13ca3; then
  echo "✅ 数据库初始化成功"
else
  echo "❌ 数据库初始化失败"
fi

# 运行测试
echo ""
echo "🧪 运行部署测试..."
if node test-deployment.js; then
  echo "✅ 测试通过"
else
  echo "❌ 测试失败"
fi

echo ""
echo "🎉 批量部署完成！"
echo "========================================"
echo ""
echo "🔗 控制台地址:"
echo "   https://console.cloud.tencent.com/tcb/env/tengfei-workstation-7czc7ab13ca3"
echo ""
echo "🚀 下一步: 配置微信小程序进行测试"