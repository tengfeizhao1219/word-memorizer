#!/bin/bash

# 快速部署脚本 - 逐个部署，避免脚本退出问题

echo "🚀 快速部署云函数"
echo "环境: tengfei-workstation-7czc7ab13ca3"
echo ""

# 已经部署的函数
deployed=("login" "getInfo" "add")

# 需要部署的函数列表
functions=("list" "detail" "search" "import" "export" "getToday" "submit")
paths=("word/list" "word/detail" "word/search" "word/import" "word/export" "review/getToday" "review/submit")

# 部署函数
deploy() {
    local func_name=$1
    local func_path=$2
    
    echo ""
    echo "📦 部署 $func_name..."
    echo "   目录: cloud-functions/$func_path"
    
    cd "cloud-functions/$func_path"
    
    # 执行部署
    if npx tcb fn deploy "$func_name" -e tengfei-workstation-7czc7ab13ca3 --yes 2>&1 | grep -q "deployed successfully\|部署成功"; then
        echo "   ✅ $func_name 部署成功"
        deployed+=("$func_name")
        return 0
    else
        echo "   ❌ $func_name 部署失败"
        return 1
    fi
    
    cd ../..
}

# 主循环
for i in "${!functions[@]}"; do
    deploy "${functions[$i]}" "${paths[$i]}"
    sleep 2  # 短暂延迟
done

echo ""
echo "========================================"
echo "📊 部署完成:"
echo "   已部署 ${#deployed[@]} 个函数"
echo ""
echo "✅ 部署成功的函数:"
for func in "${deployed[@]}"; do
    echo "   - $func"
done

# 检查总数
total_expected=10  # user(2) + word(6) + review(2)
if [ ${#deployed[@]} -eq $total_expected ]; then
    echo ""
    echo "🎉 所有 $total_expected 个云函数部署完成！"
    
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
    node test-deployment.js
else
    echo ""
    echo "⚠️ 只部署了 ${#deployed[@]}/$total_expected 个函数"
    echo "   需要手动部署剩余函数"
fi