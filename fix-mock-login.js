/**
 * 修复模拟登录函数
 * 确保useMockLogin函数正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复模拟登录函数');
console.log('========================================');
console.log('问题: useMockLogin函数不存在或有问题');
console.log('');

// 增强的useMockLogin函数
const enhancedMockLogin = `  /**
   * 使用模拟登录（开发环境）
   * 当云环境不可用时使用
   */
  useMockLogin(userInfo) {
    console.log('🔧 使用模拟登录函数');
    console.log('用户信息:', userInfo);
    
    // 生成模拟用户数据
    const mockUserData = {
      userId: 'mock_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      userInfo: {
        nickName: userInfo.nickName || '测试用户',
        avatarUrl: userInfo.avatarUrl || '',
        stats: {
          totalWords: Math.floor(Math.random() * 100),
          todayReviewCount: Math.floor(Math.random() * 20),
          streakDays: Math.floor(Math.random() * 30) + 1,
          masteryRate: Math.floor(Math.random() * 100)
        },
        settings: {
          dailyGoal: 20,
          notificationEnabled: true,
          darkMode: false
        }
      },
      token: 'mock_token_' + Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天后过期
    };
    
    console.log('📋 模拟用户数据:', mockUserData);
    
    // 保存到本地存储
    wx.setStorageSync('userId', mockUserData.userId);
    wx.setStorageSync('userInfo', mockUserData.userInfo);
    wx.setStorageSync('userStats', mockUserData.userInfo.stats);
    wx.setStorageSync('userSettings', mockUserData.userInfo.settings);
    wx.setStorageSync('authToken', mockUserData.token);
    wx.setStorageSync('tokenExpiresAt', mockUserData.expiresAt);
    wx.setStorageSync('isMockUser', true);
    wx.setStorageSync('lastLoginTime', Date.now());
    
    // 显示成功提示
    wx.showToast({
      title: '模拟登录成功',
      icon: 'success',
      duration: 2000
    });
    
    // 记录登录事件
    console.log('✅ 模拟登录成功，用户ID:', mockUserData.userId);
    console.log('   昵称:', mockUserData.userInfo.nickName);
    console.log('   统计:', mockUserData.userInfo.stats);
    
    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
    
    return mockUserData;
  },`;

// 修复登录页面
function fixLoginPage() {
  console.log('1. 修复登录页面:');
  
  const loginJsPath = path.join(__dirname, 'wechat-mini-complete', 'pages', 'login', 'login.js');
  
  try {
    let content = fs.readFileSync(loginJsPath, 'utf8');
    
    // 查找现有的useMockLogin函数
    const mockLoginStart = content.indexOf('useMockLogin(userInfo) {');
    
    if (mockLoginStart !== -1) {
      // 找到现有函数，替换它
      const mockLoginEnd = content.indexOf('},', mockLoginStart) + 2;
      if (mockLoginEnd > mockLoginStart) {
        content = content.slice(0, mockLoginStart) + enhancedMockLogin + content.slice(mockLoginEnd);
        console.log('  ✅ 替换现有的useMockLogin函数');
      } else {
        console.log('  ❌ 无法定位函数结束位置');
        return false;
      }
    } else {
      // 在合适的位置插入函数
      const insertPoint = content.indexOf('  /**\n   * 显示手机登录');
      if (insertPoint !== -1) {
        content = content.slice(0, insertPoint) + enhancedMockLogin + '\n\n' + content.slice(insertPoint);
        console.log('  ✅ 插入新的useMockLogin函数');
      } else {
        // 在文件末尾插入
        content = content.replace(/\n}$/, `\n${enhancedMockLogin}\n}`);
        console.log('  ✅ 在文件末尾添加useMockLogin函数');
      }
    }
    
    fs.writeFileSync(loginJsPath, content, 'utf8');
    console.log('  ✅ 登录页面修复完成');
    return true;
  } catch (error) {
    console.log('  ❌ 修复登录页面失败:', error.message);
    return false;
  }
}

// 创建全局可访问的测试函数
function createGlobalTestFunction() {
  console.log('');
  console.log('2. 创建全局测试函数:');
  
  const globalTestCode = `// 🌟 全局测试函数
// 在控制台直接调用

// 全局模拟登录函数
window.mockLogin = function(nickName = '测试用户') {
  console.log('🎯 调用全局模拟登录函数');
  
  const userInfo = {
    nickName: nickName,
    avatarUrl: ''
  };
  
  // 获取当前页面
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.useMockLogin) {
    console.log('✅ 使用页面内的useMockLogin函数');
    return currentPage.useMockLogin(userInfo);
  } else {
    console.log('🔧 使用备用模拟登录');
    
    const mockData = {
      userId: 'global_mock_' + Date.now(),
      userInfo: userInfo,
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
    
    wx.showToast({
      title: '全局模拟登录成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1000);
    
    return mockData;
  }
};

// 测试函数
window.testMockLogin = function() {
  console.log('🧪 测试模拟登录');
  return window.mockLogin('测试用户');
};

console.log('✅ 全局测试函数已加载');
console.log('可用函数:');
console.log('  • window.mockLogin("昵称") - 模拟登录');
console.log('  • window.testMockLogin() - 测试模拟登录');`;

  const testFilePath = path.join(__dirname, 'global-mock-test.js');
  fs.writeFileSync(testFilePath, globalTestCode, 'utf8');
  
  console.log(`  ✅ 生成全局测试函数: global-mock-test.js`);
  return testFilePath;
}

// 创建修复验证测试
function createFixVerificationTest() {
  console.log('');
  console.log('3. 创建修复验证测试:');
  
  const verificationCode = `// 🔧 修复验证测试
// 验证useMockLogin函数是否修复成功

console.log('🔍 验证模拟登录修复');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 1. 检查useMockLogin函数
console.log('1. 检查useMockLogin函数:');

// 获取当前页面
const pages = getCurrentPages();
const currentPage = pages[pages.length - 1];

if (currentPage) {
  console.log('   当前页面:', currentPage.route);
  
  if (typeof currentPage.useMockLogin === 'function') {
    console.log('   ✅ useMockLogin函数存在');
    
    // 测试函数
    const testUserInfo = {
      nickName: '验证测试用户',
      avatarUrl: ''
    };
    
    try {
      console.log('   🧪 测试函数调用...');
      const result = currentPage.useMockLogin(testUserInfo);
      console.log('   ✅ 函数调用成功');
      console.log('      返回结果:', result);
    } catch (error) {
      console.log('   ❌ 函数调用失败:', error.message);
    }
  } else {
    console.log('   ❌ useMockLogin函数不存在');
    console.log('   💡 需要进一步修复');
  }
} else {
  console.log('   ⚠️ 无法获取当前页面');
  console.log('   💡 请确保在页面上下文中运行');
}

// 2. 检查全局函数
console.log('');
console.log('2. 检查全局函数:');

if (typeof window.mockLogin === 'function') {
  console.log('   ✅ window.mockLogin函数存在');
} else {
  console.log('   ❌ window.mockLogin函数不存在');
  console.log('   💡 运行 global-mock-test.js 加载全局函数');
}

// 3. 立即测试建议
console.log('');
console.log('3. 立即测试建议:');

console.log('   🎯 如果useMockLogin存在:');
console.log('       在控制台运行:');
console.log('       const pages = getCurrentPages();');
console.log('       const page = pages[pages.length - 1];');
console.log('       page.useMockLogin({nickName: "测试"});');
console.log('');
console.log('   🎯 如果useMockLogin不存在:');
console.log('       运行全局函数:');
console.log('       window.mockLogin("测试用户");');
console.log('');
console.log('   🎯 或者运行完整测试:');
console.log('       运行 test-mock-now.js');

console.log('');
console.log('🔧 修复状态:');
console.log('   useMockLogin函数应该现在可用');`;

  const verificationPath = path.join(__dirname, 'verify-fix.js');
  fs.writeFileSync(verificationPath, verificationCode, 'utf8');
  
  console.log(`  ✅ 生成修复验证测试: verify-fix.js`);
  return verificationPath;
}

// 主修复函数
async function main() {
  console.log('开始修复模拟登录函数...');
  console.log('========================================');
  
  const fixResult = fixLoginPage();
  const globalTestFile = createGlobalTestFunction();
  const verificationFile = createFixVerificationTest();
  
  console.log('');
  console.log('========================================');
  console.log('🎯 修复完成');
  console.log('========================================');
  
  console.log('');
  console.log('📂 生成的文件:');
  console.log(`  1. 登录页面已更新 - useMockLogin函数增强`);
  console.log(`  2. ${globalTestFile} - 全局测试函数`);
  console.log(`  3. ${verificationFile} - 修复验证测试`);
  
  console.log('');
  console.log('🚀 立即测试步骤:');
  console.log('   1. 重新编译微信小程序');
  console.log('   2. 进入登录页面');
  console.log('   3. 在控制台运行 verify-fix.js');
  console.log('   4. 测试 useMockLogin 函数');
  console.log('   5. 或者运行 test-mock-now.js 完整测试');
  
  console.log('');
  console.log('💡 测试方法:');
  console.log('   方法A: 点击登录页面的「微信登录」按钮');
  console.log('         会自动调用 useMockLogin');
  console.log('');
  console.log('   方法B: 在控制台手动调用:');
  console.log('         const pages = getCurrentPages();');
  console.log('         const page = pages[pages.length - 1];');
  console.log('         page.useMockLogin({nickName: "测试"});');
  console.log('');
  console.log('   方法C: 运行全局函数:');
  console.log('         window.mockLogin("测试用户");');
  
  console.log('');
  console.log('🔧 我会:');
  console.log('   1. 等待你的测试结果');
  console.log('   2. 根据结果进一步优化');
  console.log('   3. 确保模拟模式完全可用');
  
  return fixResult;
}

// 运行修复
main().catch(console.error);