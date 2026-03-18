// 🌟 全局测试函数
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
console.log('  • window.testMockLogin() - 测试模拟登录');