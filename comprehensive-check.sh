#!/bin/bash
# 全面检查所有代码和配置

echo "🔍 全面检查所有代码和配置"
echo "========================================"
echo "检查时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_info() { echo -e "${BLUE}🔍 $1${NC}"; }

# 1. 检查文件完整性
echo "1. 文件完整性检查:"
echo "------------------"

check_file() {
    if [ -f "$1" ]; then
        local size=$(stat -c%s "$1" 2>/dev/null || stat -f%z "$1" 2>/dev/null)
        log_success "$2 ($1) - ${size}字节"
        return 0
    else
        log_error "$2 ($1) - 文件不存在"
        return 1
    fi
}

# 小程序文件
check_file "wechat-mini-complete/app.json" "小程序配置文件"
check_file "wechat-mini-complete/app.js" "小程序逻辑文件"
check_file "wechat-mini-complete/pages/login/login.js" "登录页面逻辑"
check_file "wechat-mini-complete/pages/login/login.wxml" "登录页面结构"

# 云函数文件
check_file "cloud-functions/user/login/index.js" "登录云函数"
check_file "cloud-functions/user/login/package.json" "云函数依赖配置"

echo ""

# 2. 检查配置一致性
echo "2. 配置一致性检查:"
echo "------------------"

# 检查app.json中的cloud配置
if grep -q '"cloud": true' wechat-mini-complete/app.json; then
    log_success "app.json: cloud配置正确"
else
    log_error "app.json: 缺少cloud: true配置"
fi

# 检查环境ID
if grep -q "tengfei-workstation-7czc7ab13ca3" wechat-mini-complete/app.js; then
    log_success "app.js: 环境ID配置正确"
else
    log_warning "app.js: 未找到环境ID，可能使用动态环境"
fi

# 检查云开发初始化
if grep -q "wx.cloud.init" wechat-mini-complete/app.js; then
    log_success "app.js: 有云开发初始化"
else
    log_error "app.js: 缺少云开发初始化"
fi

echo ""

# 3. 检查云函数代码
echo "3. 云函数代码检查:"
echo "------------------"

# 检查云函数导出
if grep -q "exports.main" cloud-functions/user/login/index.js; then
    log_success "云函数: 有导出函数"
else
    log_error "云函数: 缺少导出函数"
fi

# 检查数据库操作
if grep -q "cloud.database" cloud-functions/user/login/index.js; then
    log_success "云函数: 有数据库初始化"
else
    log_error "云函数: 缺少数据库初始化"
fi

# 检查users集合
if grep -q "collection('users')" cloud-functions/user/login/index.js; then
    log_success "云函数: 使用users集合"
else
    log_error "云函数: 未使用users集合"
fi

# 检查错误处理
if grep -q "try" cloud-functions/user/login/index.js && grep -q "catch" cloud-functions/user/login/index.js; then
    log_success "云函数: 有错误处理"
else
    log_warning "云函数: 错误处理可能不完整"
fi

echo ""

# 4. 检查登录页面代码
echo "4. 登录页面代码检查:"
echo "---------------------"

# 检查云函数调用
if grep -q "wx.cloud.callFunction" wechat-mini-complete/pages/login/login.js; then
    log_success "登录页面: 有云函数调用"
    
    # 检查函数名
    if grep -q "name: 'login'" wechat-mini-complete/pages/login/login.js; then
        log_success "登录页面: 云函数名称正确"
    else
        log_error "登录页面: 云函数名称可能错误"
    fi
else
    log_error "登录页面: 没有云函数调用"
fi

# 检查错误处理
if grep -q ".fail" wechat-mini-complete/pages/login/login.js; then
    log_success "登录页面: 有失败处理"
else
    log_warning "登录页面: 缺少失败处理"
fi

# 检查备用方案
if grep -q "useMockLogin" wechat-mini-complete/pages/login/login.js; then
    log_success "登录页面: 有备用登录方案"
else
    log_warning "登录页面: 缺少备用登录方案"
fi

echo ""

# 5. 生成测试代码
echo "5. 生成测试代码:"
echo "----------------"

cat > test-all-in-one.js << 'EOF'
// 🧪 全面测试代码
// 在微信开发者工具控制台运行

console.log('🚀 开始全面测试')
console.log('时间:', new Date().toLocaleString())
console.log('')

// 1. 环境检查
console.log('1. 环境检查:')
console.log('  wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在')
console.log('  wx.cloud:', wx.cloud ? '✅ 存在' : '❌ 不存在')

if (!wx.cloud) {
    console.log('❌ 致命错误: 请检查云开发配置')
    return
}

// 2. 初始化测试
console.log('')
console.log('2. 初始化测试:')
try {
    wx.cloud.init({
        env: 'tengfei-workstation-7czc7ab13ca3',
        traceUser: true
    })
    console.log('  ✅ 初始化成功')
} catch (err) {
    console.log('  ❌ 初始化失败:', err.message)
    return
}

// 3. 云函数测试
console.log('')
console.log('3. 云函数测试:')

// 简单测试
wx.cloud.callFunction({
    name: 'login',
    data: { action: 'test' },
    success: (res) => {
        console.log('  ✅ 调用成功:', res)
    },
    fail: (err) => {
        console.log('  ❌ 调用失败:')
        console.log('     错误:', err.message)
        console.log('     代码:', err.errCode || '未知')
        console.log('     详情:', err)
    }
})

console.log('')
console.log('🎯 测试发起，请查看结果')
console.log('💡 如果失败，请提供错误信息')
EOF

log_success "生成测试代码: test-all-in-one.js"

echo ""
echo "========================================"
echo "📋 检查完成"
echo "========================================"
echo ""
echo "🚀 立即操作:"
echo "  1. 重新编译微信小程序"
echo "  2. 在控制台运行 test-all-in-one.js"
echo "  3. 查看具体的错误信息"
echo "  4. 根据错误信息针对性修复"
echo ""
echo "💡 如果仍有问题，请提供:"
echo "  - 完整的错误信息"
echo "  - 控制台截图"
echo "  - 网络请求详情"
echo ""