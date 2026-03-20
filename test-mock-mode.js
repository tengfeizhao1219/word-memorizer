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
