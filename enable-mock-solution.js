/**
 * 启用模拟解决方案
 * 环境不存在时的完整备用方案
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 启用模拟解决方案');
console.log('========================================');
console.log('环境ID: tengfei-workstation-7czc7ab13ca3');
console.log('状态: ❌ 不存在，启用备用方案');
console.log('');

// 1. 增强登录页面的模拟功能
function enhanceLoginPageMock() {
  console.log('1. 增强登录页面模拟功能:');
  
  const loginJsPath = path.join(__dirname, 'wechat-mini-complete', 'pages', 'login', 'login.js');
  
  try {
    let content = fs.readFileSync(loginJsPath, 'utf8');
    
    // 检查是否已有模拟登录
    if (!content.includes('useMockLogin')) {
      console.log('  ❌ 未找到模拟登录函数');
      return false;
    }
    
    // 增强模拟登录函数
    const enhancedMockLogin = `
/**
 * 增强模拟登录函数
 * 当云环境不可用时使用
 */
function useMockLogin(userInfo) {
  console.log('🔧 使用增强模拟登录（云环境不可用）');
  
  // 生成模拟用户数据
  const mockUserData = {
    userId: 'mock_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    userInfo: {
      nickName: userInfo.nickName || '测试用户',
      avatarUrl: userInfo.avatarUrl || '/images/default-avatar.png',
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
}`;

    // 替换原有的useMockLogin函数
    const oldMockLoginRegex = /function useMockLogin\([^)]*\)\s*\{[\s\S]*?\n\}/;
    if (oldMockLoginRegex.test(content)) {
      content = content.replace(oldMockLoginRegex, enhancedMockLogin);
      console.log('  ✅ 替换模拟登录函数');
    } else {
      // 如果找不到，在文件末尾添加
      content = content.replace(/\n}$/, `\n${enhancedMockLogin}\n}`);
      console.log('  ✅ 添加模拟登录函数');
    }
    
    // 增强云函数调用失败处理
    const enhancedFailHandler = `
          fail: (err) => {
            console.error('❌ 云函数调用失败:', err);
            console.log('错误代码:', err.errCode || '未知');
            console.log('错误信息:', err.message);
            
            // 显示用户友好的错误信息
            let errorMsg = '登录失败';
            if (err.errCode === -501000) {
              errorMsg = '云环境不可用，使用模拟登录';
            } else if (err.message.includes('env not exists')) {
              errorMsg = '环境配置错误，使用模拟登录';
            }
            
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            });
            
            // 自动使用模拟登录
            console.log('🔧 自动切换到模拟登录...');
            setTimeout(() => {
              const mockResult = useMockLogin(userInfo);
              console.log('模拟登录结果:', mockResult);
            }, 1000);
          }`;
    
    // 替换fail处理
    const failHandlerRegex = /fail:\s*\(err\)\s*=>\s*\{[\s\S]*?\n\s*\}/;
    if (failHandlerRegex.test(content)) {
      content = content.replace(failHandlerRegex, enhancedFailHandler);
      console.log('  ✅ 增强失败处理');
    }
    
    fs.writeFileSync(loginJsPath, content, 'utf8');
    console.log('  ✅ 登录页面增强完成');
    return true;
  } catch (error) {
    console.log('  ❌ 增强登录页面失败:', error.message);
    return false;
  }
}

// 2. 增强首页的模拟数据支持
function enhanceHomePageMock() {
  console.log('');
  console.log('2. 增强首页模拟数据支持:');
  
  const homeJsPath = path.join(__dirname, 'wechat-mini-complete', 'pages', 'index', 'index.js');
  
  try {
    let content = fs.readFileSync(homeJsPath, 'utf8');
    
    // 添加模拟数据加载
    const mockDataLoader = `
  /**
   * 加载模拟数据
   */
  loadMockData: function() {
    console.log('📊 加载模拟数据...');
    
    // 检查是否是模拟用户
    const isMockUser = wx.getStorageSync('isMockUser') || false;
    
    if (isMockUser) {
      console.log('🔧 模拟用户，使用模拟数据');
      
      // 模拟用户统计
      const mockStats = wx.getStorageSync('userStats') || {
        totalWords: 42,
        todayReviewCount: 8,
        streakDays: 7,
        masteryRate: 65
      };
      
      // 模拟今日复习单词
      const mockTodayWords = [
        { id: 'mock_1', word: 'abandon', meaning: '放弃，遗弃', example: 'He decided to abandon the project.' },
        { id: 'mock_2', word: 'benefit', meaning: '好处，利益', example: 'Regular exercise has many benefits.' },
        { id: 'mock_3', word: 'challenge', meaning: '挑战', example: 'This job presents a new challenge.' },
        { id: 'mock_4', word: 'determine', meaning: '决定，确定', example: 'We need to determine the cause.' }
      ];
      
      // 模拟学习进度
      const mockProgress = {
        today: 8,
        goal: 20,
        percentage: 40,
        remaining: 12
      };
      
      // 更新页面数据
      this.setData({
        userStats: mockStats,
        todayWords: mockTodayWords,
        learningProgress: mockProgress,
        isMockMode: true
      });
      
      console.log('✅ 模拟数据加载完成');
      return true;
    }
    
    return false;
  },`;
    
    // 在methods中添加
    const methodsStart = content.indexOf('methods: {');
    if (methodsStart !== -1) {
      const insertPos = methodsStart + 'methods: {'.length + 1;
      content = content.slice(0, insertPos) + mockDataLoader + content.slice(insertPos);
      console.log('  ✅ 添加模拟数据加载方法');
    }
    
    // 修改onLoad函数，优先尝试模拟数据
    const onLoadRegex = /onLoad:\s*function\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\},/;
    if (onLoadRegex.test(content)) {
      const enhancedOnLoad = `  onLoad: function(options) {
    console.log('🏠 首页加载，环境状态:', wx.cloud ? '可用' : '不可用');
    
    // 先尝试加载模拟数据
    const mockLoaded = this.loadMockData();
    
    if (mockLoaded) {
      console.log('✅ 使用模拟数据');
      wx.showToast({
        title: '模拟模式',
        icon: 'none',
        duration: 1500
      });
    } else {
      console.log('🔍 非模拟用户，尝试云数据');
      // 原有的云数据加载逻辑
      this.loadUserStats();
      this.loadTodayWords();
    }
    
    // 检查登录状态
    this.checkLoginStatus();
  },`;
      
      content = content.replace(onLoadRegex, enhancedOnLoad);
      console.log('  ✅ 增强onLoad函数');
    }
    
    fs.writeFileSync(homeJsPath, content, 'utf8');
    console.log('  ✅ 首页增强完成');
    return true;
  } catch (error) {
    console.log('  ❌ 增强首页失败:', error.message);
    return false;
  }
}

// 3. 创建环境状态检测工具
function createEnvStatusTool() {
  console.log('');
  console.log('3. 创建环境状态检测工具:');
  
  const toolCode = `// 🔧 环境状态检测工具
// 在微信开发者工具控制台运行

console.log('🔍 环境状态检测');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 检测云环境状态
function checkCloudEnvironment() {
  console.log('1. 云环境检测:');
  
  if (!wx.cloud) {
    console.log('  ❌ wx.cloud 不存在');
    console.log('  💡 请检查云开发配置');
    return { available: false, reason: 'wx.cloud不存在' };
  }
  
  console.log('  ✅ wx.cloud 存在');
  
  // 尝试初始化
  try {
    wx.cloud.init({
      env: 'tengfei-workstation-7czc7ab13ca3',
      traceUser: true
    });
    console.log('  ✅ 云开发初始化成功');
  } catch (error) {
    console.log('  ❌ 云开发初始化失败:', error.message);
    return { available: false, reason: '初始化失败' };
  }
  
  // 测试云函数调用
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'user-login',
      data: { action: 'test' },
      success: (res) => {
        console.log('  ✅ 云函数调用成功');
        console.log('     返回结果:', res);
        resolve({ available: true, data: res });
      },
      fail: (err) => {
        console.log('  ❌ 云函数调用失败');
        console.log('     错误代码:', err.errCode || '未知');
        console.log('     错误信息:', err.message);
        resolve({ available: false, reason: '云函数调用失败', error: err });
      }
    });
  });
}

// 检测模拟模式状态
function checkMockModeStatus() {
  console.log('');
  console.log('2. 模拟模式检测:');
  
  const isMockUser = wx.getStorageSync('isMockUser') || false;
  const userId = wx.getStorageSync('userId');
  const userInfo = wx.getStorageSync('userInfo');
  
  console.log('  模拟用户:', isMockUser ? '✅ 是' : '❌ 否');
  console.log('  用户ID:', userId || '未设置');
  console.log('  用户信息:', userInfo ? '✅ 已保存' : '❌ 未保存');
  
  return {
    mockMode: isMockUser,
    hasUserData: !!userId,
    userInfo: userInfo
  };
}

// 提供解决方案
function provideSolutions(cloudStatus, mockStatus) {
  console.log('');
  console.log('3. 解决方案:');
  console.log('----------------');
  
  if (cloudStatus.available) {
    console.log('✅ 云环境可用');
    console.log('   建议: 使用云服务');
  } else {
    console.log('❌ 云环境不可用');
    console.log('   原因:', cloudStatus.reason);
    console.log('');
    console.log('🔧 备用方案:');
    console.log('   1. 使用模拟登录');
    console.log('   2. 测试本地功能');
    console.log('   3. 检查腾讯云配置');
    
    if (!mockStatus.mockMode) {
      console.log('');
      console.log('🚀 立即操作:');
      console.log('   运行以下代码启用模拟模式:');
      console.log(`
        // 启用模拟登录
        const mockUserInfo = {
          nickName: '测试用户',
          avatarUrl: ''
        };
        
        // 调用模拟登录函数
        if (typeof useMockLogin === 'function') {
          useMockLogin(mockUserInfo);
        } else {
          console.log('❌ useMockLogin函数不存在');
        }
      `);
    } else {
      console.log('');
      console.log('✅ 模拟模式已启用');
      console.log('   可以正常测试功能');
    }
  }
}

// 运行检测
async function runDiagnostics() {
  console.log('开始环境状态检测...');
  console.log('========================================');
  
  const cloudStatus = await checkCloudEnvironment();
  const mockStatus = checkMockModeStatus();
  
  console.log('');
  console.log('========================================');
  console.log('📊 检测结果汇总');
  console.log('========================================');
  
  provideSolutions(cloudStatus, mockStatus);
  
  console.log('');
  console.log('💡 后续步骤:');
  if (!cloudStatus.available) {
    console.log('   1. 使用模拟模式继续开发');
    console.log('   2. 修复腾讯云环境问题');
    console.log('   3. 环境恢复后切换回云服务');
  }
}

// 运行检测
runDiagnostics().catch(console.error);`;

  const toolPath = path.join(__dirname, 'check-env-status-tool.js');
  fs.writeFileSync(toolPath, toolCode, 'utf8');
  
  console.log(`  ✅ 生成检测工具: check-env-status-tool.js`);
  return toolPath;
}

// 4. 创建模拟模式使用指南
function createMockModeGuide() {
  console.log('');
  console.log('4. 创建模拟模式使用指南:');
  
  const guide = `# 🔧 模拟模式使用指南
## 当云环境不可用时使用

---

## 🎯 当前状态

### 环境检测结果:
\`\`\`
环境ID: tengfei-workstation-7czc7ab13ca3
状态: ❌ 不存在 (env not exists)
错误代码: -501000 (INVALID_ENV)
\`\`\`

### 已启用的解决方案:
\`\`\`
✅ 增强模拟登录函数
✅ 首页模拟数据支持
✅ 自动失败切换
✅ 完整本地功能测试
\`\`\`

---

## 🚀 如何使用模拟模式

### 步骤1: 运行环境检测
\`\`\`
在控制台运行: check-env-status-tool.js
\`\`\`

### 步骤2: 启用模拟登录
\`\`\`
1. 进入登录页面
2. 点击「微信登录」按钮
3. 云函数调用会自动失败
4. 自动切换到模拟登录
5. 跳转到首页
\`\`\`

### 步骤3: 测试功能
\`\`\`
✅ 首页统计数据显示
✅ 今日复习单词列表
✅ 学习进度展示
✅ 页面跳转功能
✅ 本地存储功能
\`\`\`

---

## 📋 模拟数据内容

### 用户数据:
\`\`\`
- 随机用户ID
- 昵称: 测试用户 (或微信昵称)
- 头像: 默认头像
- 统计信息: 随机生成
- 设置: 默认配置
\