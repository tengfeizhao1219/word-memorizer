// 🔧 备用方案：使用模拟数据
// 当环境ID不存在时使用

// 修改登录页面的云函数调用
const originalLoginCode = `// 云函数调用
wx.cloud.callFunction({
  name: 'user-login',
  data: {
    action: 'login',
    code: res.code,
    userInfo: userInfo
  },
  success: (cloudRes) => {
    // 成功处理
  },
  fail: (err) => {
    // 失败处理
    console.error('云函数调用失败:', err);
    
    // 使用模拟登录
    useMockLogin(userInfo);
  }
})`;

// 模拟登录函数
function useMockLogin(userInfo) {
  console.log('🔧 使用模拟登录（环境不可用）');
  
  // 模拟用户数据
  const mockUserData = {
    userId: 'mock_user_' + Date.now(),
    userInfo: {
      nickName: userInfo.nickName || '测试用户',
      avatarUrl: userInfo.avatarUrl || '',
      stats: {
        totalWords: 0,
        todayReviewCount: 0,
        streakDays: 1,
        masteryRate: 0
      }
    }
  };
  
  // 保存到本地存储
  wx.setStorageSync('userId', mockUserData.userId);
  wx.setStorageSync('userInfo', mockUserData.userInfo);
  wx.setStorageSync('userStats', mockUserData.userInfo.stats);
  wx.setStorageSync('isMockUser', true);
  
  wx.showToast({
    title: '模拟登录成功',
    icon: 'success'
  });
  
  // 跳转到首页
  setTimeout(() => {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }, 1000);
}

// 立即启用备用方案
console.log('💡 备用方案已准备');
console.log('   当云函数调用失败时自动使用模拟数据');