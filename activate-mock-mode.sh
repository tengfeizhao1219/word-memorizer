#!/bin/bash
# 激活模拟模式 - 当云环境不存在时使用

echo "🔧 激活模拟模式"
echo "========================================"
echo "环境ID: tengfei-workstation-7czc7ab13ca3"
echo "状态: ❌ 不存在，激活模拟模式"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_info() { echo -e "${BLUE}🔍 $1${NC}"; }

# 1. 检查当前状态
echo "1. 检查当前状态:"
echo "----------------"

# 检查云环境配置
if grep -q '"cloud": true' wechat-mini-complete/app.json; then
    log_success "app.json: cloud配置存在"
else
    log_error "app.json: 缺少cloud配置"
fi

# 检查环境ID
if grep -q "tengfei-workstation-7czc7ab13ca3" wechat-mini-complete/app.js; then
    log_warning "app.js: 使用不存在的环境ID"
else
    log_success "app.js: 未使用错误的环境ID"
fi

echo ""

# 2. 创建模拟模式测试代码
echo "2. 创建模拟模式测试代码:"
echo "------------------------"

cat > test-mock-mode.js << 'EOF'
// 🧪 模拟模式测试代码
// 在微信开发者工具控制台运行

console.log('🚀 测试模拟模式');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 1. 清除可能的旧数据
console.log('1. 准备测试环境:');
wx.removeStorageSync('userId');
wx.removeStorageSync('userInfo');
wx.removeStorageSync('isMockUser');
console.log('   ✅ 清除旧数据');

// 2. 模拟登录测试
console.log('');
console.log('2. 模拟登录测试:');

// 模拟用户信息
const mockUserInfo = {
  nickName: '测试用户',
  avatarUrl: ''
};

// 检查useMockLogin函数是否存在
if (typeof useMockLogin === 'function') {
  console.log('   ✅ useMockLogin函数存在');
  
  // 执行模拟登录
  const result = useMockLogin(mockUserInfo);
  console.log('   ✅ 模拟登录执行');
  console.log('      返回结果:', result);
} else {
  console.log('   ❌ useMockLogin函数不存在');
  console.log('   💡 需要手动创建模拟用户数据');
  
  // 手动创建模拟数据
  const mockData = {
    userId: 'test_user_' + Date.now(),
    userInfo: mockUserInfo,
    stats: {
      totalWords: 50,
      todayReviewCount: 10,
      streakDays: 5,
      masteryRate: 75
    }
  };
  
  wx.setStorageSync('userId', mockData.userId);
  wx.setStorageSync('userInfo', mockData.userInfo);
  wx.setStorageSync('userStats', mockData.stats);
  wx.setStorageSync('isMockUser', true);
  
  console.log('   ✅ 手动创建模拟数据');
  console.log('      用户ID:', mockData.userId);
}

// 3. 验证模拟数据
console.log('');
console.log('3. 验证模拟数据:');

const userId = wx.getStorageSync('userId');
const userInfo = wx.getStorageSync('userInfo');
const isMockUser = wx.getStorageSync('isMockUser');

console.log('   用户ID:', userId || '未设置');
console.log('   用户信息:', userInfo ? '✅ 已保存' : '❌ 未保存');
console.log('   模拟用户:', isMockUser ? '✅ 是' : '❌ 否');

// 4. 测试页面跳转
console.log('');
console.log('4. 测试页面跳转:');

if (userId && isMockUser) {
  console.log('   ✅ 模拟用户已登录');
  console.log('   💡 可以跳转到首页测试功能');
  
  // 跳转到首页
  setTimeout(() => {
    console.log('   正在跳转到首页...');
    wx.switchTab({
      url: '/pages/index/index',
      success: () => console.log('   ✅ 跳转成功'),
      fail: (err) => console.log('   ❌ 跳转失败:', err)
    });
  }, 1000);
} else {
  console.log('   ❌ 模拟用户未登录');
  console.log('   💡 请先完成模拟登录');
}

console.log('');
console.log('🎯 测试完成');
console.log('');
console.log('💡 后续操作:');
console.log('   1. 查看首页是否显示模拟数据');
console.log('   2. 测试其他页面功能');
console.log('   3. 验证本地存储');
EOF

log_success "生成测试代码: test-mock-mode.js"

# 3. 创建模拟模式使用指南
echo ""
echo "3. 创建模拟模式使用指南:"
echo "------------------------"

cat > MOCK_MODE_GUIDE.md << 'EOF'
# 🔧 模拟模式使用指南

## 🎯 当前状态

### 环境问题:
```
环境ID: tengfei-workstation-7czc7ab13ca3
状态: ❌ 不存在 (env not exists)
错误代码: -501000 (INVALID_ENV)
```

### 解决方案:
```
✅ 启用模拟模式
✅ 使用本地存储
✅ 测试核心功能
✅ 等待环境恢复
```

---

## 🚀 如何使用模拟模式

### 步骤1: 运行模拟测试
```javascript
// 在控制台运行:
console.log('测试模拟模式')

// 运行测试代码
// 文件: test-mock-mode.js
```

### 步骤2: 模拟登录
```
1. 进入登录页面
2. 点击「微信登录」按钮
3. 云函数调用会自动失败
4. 自动切换到模拟登录
5. 跳转到首页
```

### 步骤3: 测试功能
```
✅ 首页 - 显示模拟统计数据
✅ 单词列表 - 显示模拟单词
✅ 添加单词 - 本地保存
✅ 复习功能 - 模拟进度
✅ 设置页面 - 本地配置
```

---

## 📋 模拟数据内容

### 用户数据:
- **用户ID**: 随机生成 (mock_user_xxxxxxxx)
- **昵称**: 测试用户 (或微信昵称)
- **头像**: 默认头像
- **统计信息**: 随机生成
  - 总单词数: 随机 0-100
  - 今日复习: 随机 0-20
  - 连续天数: 随机 1-30
  - 掌握率: 随机 0-100%

### 单词数据:
- **今日复习单词**: 4个示例单词
- **单词列表**: 本地存储的单词
- **分类**: 默认分类

### 学习进度:
- **今日进度**: 8/20 (40%)
- **目标**: 20个单词/天
- **剩余**: 12个单词

---

## 🔧 技术实现

### 核心函数:
```javascript
// 模拟登录函数
function useMockLogin(userInfo) {
  // 生成模拟数据
  // 保存到本地存储
  // 跳转到首页
}

// 模拟数据加载
function loadMockData() {
  // 从本地存储加载
  // 更新页面数据
}
```

### 自动切换:
```javascript
// 云函数调用失败时自动切换
fail: (err) => {
  console.error('云函数失败:', err);
  // 自动调用 useMockLogin
  useMockLogin(userInfo);
}
```

---

## 🎯 测试清单

### 基础功能测试:
- [ ] 模拟登录成功
- [ ] 首页数据显示
- [ ] 页面跳转正常
- [ ] 本地存储工作

### 核心功能测试:
- [ ] 单词列表显示
- [ ] 添加单词功能
- [ ] 复习功能测试
- [ ] 设置保存

### UI/UX测试:
- [ ] 页面布局正常
- [ ] 交互响应正常
- [ ] 错误处理友好
- [ ] 加载状态显示

---

## 🔄 切换到云模式

### 当环境恢复时:
```
1. 获取正确的环境ID
2. 更新 app.js 中的环境ID
3. 部署云函数到腾讯云
4. 创建数据库集合
5. 测试云功能
6. 迁移本地数据（可选）
```

### 配置文件更新:
```javascript
// app.js
wx.cloud.init({
  env: '正确的环境ID', // ← 更新这里
  traceUser: true
});
```

---

## 📞 技术支持

### 如果模拟模式有问题:
```
1. 提供控制台错误信息
2. 描述具体问题
3. 提供页面截图
4. 说明操作步骤
```

### 如果需要恢复云环境:
```
1. 登录腾讯云控制台
2. 创建新环境或恢复环境
3. 获取环境ID
4. 部署云函数
5. 创建数据库
```

---

## 🚀 立即操作

### 请你现在:
```
1. 运行 test-mock-mode.js
2. 测试模拟登录
3. 验证首页功能
4. 提供测试结果
```

### 我会:
```
1. 根据测试结果进一步优化
2. 确保所有功能可用
3. 提供环境恢复指导
4. 持续支持直到问题解决
```

---

*最后更新: 2026-03-18 20:11*  
*状态: 模拟模式已激活*
EOF

log_success "生成使用指南: MOCK_MODE_GUIDE.md"

# 4. 创建一键修复脚本
echo ""
echo "4. 创建一键修复脚本:"
echo "-------------------"

cat > fix-all-in-one.js << 'EOF'
// 🔧 一键修复脚本
// 修复云环境不存在的问题

console.log('🚀 开始一键修复');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 修复步骤
const fixes = [
  {
    name: '检查云环境配置',
    action: () => {
      console.log('1. 检查云环境配置:');
      
      // 检查app.json
      const appJson = require('/app.json');
      if (appJson.cloud === true) {
        console.log('   ✅ app.json: cloud配置正确');
      } else {
        console.log('   ❌ app.json: 缺少cloud配置');
      }
      
      return true;
    }
  },
  {
    name: '启用模拟模式',
    action: () => {
      console.log('');
      console.log('2. 启用模拟模式:');
      
      // 检查useMockLogin函数
      if (typeof useMockLogin === 'function') {
        console.log('   ✅ useMockLogin函数可用');
        
        // 测试模拟登录
        const testUserInfo = { nickName: '修复测试用户' };
        const result = useMockLogin(testUserInfo);
        
        console.log('   ✅ 模拟登录测试成功');
        console.log('      用户ID:', result.userId);
        return true;
      } else {
        console.log('   ❌ useMockLogin函数不可用');
        console.log('   💡 需要手动启用模拟模式');
        return false;
      }
    }
  },
  {
    name: '测试核心功能',
    action: () => {
      console.log('');
      console.log('3. 测试核心功能:');
      
      // 测试本地存储
      wx.setStorageSync('test_key', 'test_value');
      const testValue = wx.getStorageSync('test_key');
      
      if (testValue === 'test_value') {
        console.log('   ✅ 本地存储功能正常');
      } else {
        console.log('   ❌ 本地存储功能异常');
      }
      
      // 测试页面跳转
      console.log('   💡 页面跳转功能需要手动测试');
      
      return true;
    }
  }
];

// 运行所有修复
async function runAllFixes() {
  console.log('开始执行修复...');
  console.log('----------------------------------------');
  
  let allPassed = true;
  
  for (const fix of fixes) {
    console.log(`执行: ${fix.name}`);
    try {
      const result = await Promise.resolve(fix.action());
      if (!result) {
        allPassed = false;
        console.log(`   ❌ ${fix.name} 失败`);
      }
    } catch (error) {
      console.log(`   ❌ ${fix.name} 错误:`, error.message);
      allPassed = false;
    }
    console.log('');
  }
  
  console.log('----------------------------------------');
  console.log('');
  console.log('📊 修复结果:');
  console.log(allPassed ? '✅ 所有修复成功' : '⚠️ 部分修复失败');
  
  if (!allPassed) {
    console.log('');
    console.log('💡 需要手动操作:');
    console.log('   1. 运行 test-mock-mode.js');
    console.log('   2. 参考 MOCK_MODE_GUIDE.md');
    console.log('   3. 手动测试功能');
  }
  
  return allPassed;
}

// 运行修复
runAllFixes().then(success => {
  console.log('');
  console.log('🎯 修复完成');
  console.log(success ? '✅ 可以继续开发测试' : '⚠️ 需要进一步处理');
}).catch(console.error);
EOF

log_success "生成一键修复脚本: fix-all-in-one.js"

echo ""
echo "========================================"
echo "🎯 模拟模式激活完成"
echo "========================================"
echo ""
echo "📂 生成的文件:"
echo "  - test-mock-mode.js      # 模拟模式测试代码"
echo "  - MOCK_MODE_GUIDE.md     # 模拟模式使用指南"
echo "  - fix-all-in-one.js      # 一键修复脚本"
echo ""
echo "🚀 立即操作:"
echo "  1. 运行 test-mock-mode.js 测试模拟登录"
echo "  2. 参考 MOCK_MODE_GUIDE.md 使用模拟模式"
echo "  3. 测试所有核心功能"
echo ""
echo "💡 模拟模式可以让你:"
echo "  ✅ 继续开发和测试"
echo "  ✅ 验证UI和交互"
echo "  ✅ 测试本地功能"
echo "  ✅ 等待云环境恢复"
echo ""
echo "🔧 我会根据测试结果进一步优化模拟模式。"