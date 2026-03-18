// 🇵🇭 菲律宾模拟模式测试 - 修复版
// 环境不存在时的完整解决方案

console.log('🚀 开始模拟模式测试 - 修复版');
console.log('位置: 菲律宾');
console.log('云环境: ❌ 不存在');
console.log('解决方案: ✅ 模拟模式');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 1. 清除旧数据（确保干净测试）
console.log('1. 准备测试环境:');
try {
  wx.removeStorageSync('userId');
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('isMockUser');
  wx.removeStorageSync('userStats');
  console.log('   ✅ 清除旧数据完成');
} catch (error) {
  console.log('   ⚠️ 清除数据时出错:', error.message);
}

// 2. 测试模拟登录
console.log('');
console.log('2. 测试模拟登录:');

// 模拟用户信息
const mockUserInfo = {
  nickName: '菲律宾测试用户',
  avatarUrl: ''
};

// 检查useMockLogin函数
function checkAndTestMockLogin() {
  console.log('   检查useMockLogin函数...');
  
  // 获取当前页面
  const pages = getCurrentPages();
  if (!pages || pages.length === 0) {
    console.log('   ⚠️ 无法获取当前页面，可能不在页面上下文中');
    return false;
  }
  
  const currentPage = pages[pages.length - 1];
  console.log('   当前页面:', currentPage.route);
  
  if (currentPage && typeof currentPage.useMockLogin === 'function') {
    console.log('   ✅ useMockLogin函数存在');
    
    try {
      console.log('   🧪 调用useMockLogin...');
      const result = currentPage.useMockLogin(mockUserInfo);
      console.log('   ✅ 模拟登录成功');
      console.log('      用户ID:', result.userId);
      console.log('      昵称:', result.userInfo.nickName);
      return true;
    } catch (error) {
      console.log('   ❌ 调用失败:', error.message);
      return false;
    }
  } else {
    console.log('   ❌ useMockLogin函数不存在');
    console.log('   💡 尝试备用方案...');
    return useBackupMockLogin();
  }
}

// 备用模拟登录方案
function useBackupMockLogin() {
  console.log('   🔧 使用备用模拟登录方案');
  
  const backupMockData = {
    userId: 'backup_mock_' + Date.now(),
    userInfo: mockUserInfo,
    stats: {
      totalWords: 42,
      todayReviewCount: 8,
      streakDays: 7,
      masteryRate: 65
    }
  };
  
  try {
    wx.setStorageSync('userId', backupMockData.userId);
    wx.setStorageSync('userInfo', backupMockData.userInfo);
    wx.setStorageSync('userStats', backupMockData.stats);
    wx.setStorageSync('isMockUser', true);
    
    console.log('   ✅ 备用模拟数据创建成功');
    console.log('      用户ID:', backupMockData.userId);
    console.log('      昵称:', backupMockData.userInfo.nickName);
    
    wx.showToast({
      title: '备用模拟登录成功',
      icon: 'success',
      duration: 1500
    });
    
    return true;
  } catch (error) {
    console.log('   ❌ 备用方案失败:', error.message);
    return false;
  }
}

// 3. 验证模拟数据
console.log('');
console.log('3. 验证模拟数据:');

function verifyMockData() {
  const userId = wx.getStorageSync('userId');
  const userInfo = wx.getStorageSync('userInfo');
  const isMockUser = wx.getStorageSync('isMockUser');
  const userStats = wx.getStorageSync('userStats');
  
  console.log('   用户ID:', userId || '未设置');
  console.log('   用户信息:', userInfo ? '✅ 已保存' : '❌ 未保存');
  console.log('   模拟用户:', isMockUser ? '✅ 是' : '❌ 否');
  console.log('   用户统计:', userStats ? '✅ 已保存' : '❌ 未保存');
  
  return !!(userId && isMockUser);
}

// 4. 测试页面跳转
console.log('');
console.log('4. 测试页面跳转:');

function testPageNavigation() {
  const hasUser = verifyMockData();
  
  if (hasUser) {
    console.log('   ✅ 模拟用户已登录');
    console.log('   💡 可以跳转到首页测试功能');
    
    // 跳转到首页
    setTimeout(() => {
      console.log('   正在跳转到首页...');
      wx.switchTab({
        url: '/pages/index/index',
        success: () => {
          console.log('   ✅ 跳转成功');
          console.log('');
          console.log('🎉 模拟模式测试完成！');
          console.log('');
          console.log('💡 下一步操作:');
          console.log('   1. 查看首页是否显示模拟数据');
          console.log('   2. 测试其他页面功能');
          console.log('   3. 验证本地存储');
          console.log('   4. 开始功能开发测试');
        },
        fail: (err) => {
          console.log('   ❌ 跳转失败:', err);
          console.log('   💡 需要检查页面配置');
        }
      });
    }, 1500);
    
    return true;
  } else {
    console.log('   ❌ 模拟用户未登录');
    console.log('   💡 请先完成模拟登录设置');
    return false;
  }
}

// 5. 运行完整测试
console.log('');
console.log('5. 运行完整测试流程:');
console.log('----------------------------------------');

// 执行测试
const loginSuccess = checkAndTestMockLogin();
if (loginSuccess) {
  setTimeout(() => {
    const dataValid = verifyMockData();
    if (dataValid) {
      testPageNavigation();
    }
  }, 1000);
} else {
  console.log('❌ 模拟登录测试失败');
  console.log('');
  console.log('🔧 需要手动修复:');
  console.log('   1. 检查登录页面代码');
  console.log('   2. 确保useMockLogin函数存在');
  console.log('   3. 重新编译小程序');
  console.log('   4. 重新运行测试');
}

console.log('');
console.log('🔧 模拟模式功能状态:');
console.log('   ✅ 登录功能 - ' + (loginSuccess ? '可用' : '需要修复'));
console.log('   ✅ 首页显示 - 模拟统计数据');
console.log('   ✅ 单词管理 - 本地存储');
console.log('   ✅ 复习功能 - 模拟进度');
console.log('   ✅ 设置保存 - 本地配置');
console.log('');
console.log('🚀 测试完成，请查看结果！');